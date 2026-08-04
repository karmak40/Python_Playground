"""Real breakpoint debuggers for Margin — two drivers, one `bdb` subclass each.

Both subclass CPython's own `bdb` — the machinery `pdb` is built on — rather
than hand-rolling `sys.settrace`, because getting step-over/step-out right
around generators, comprehensions and exception unwinding is where hand-rolled
debuggers break.

`RecordingDebugger` runs the script once to completion, capturing the real
line and locals at every step, then hands the whole trace to the UI to scrub
through. It needs no SharedArrayBuffer and no cross-origin isolation, so it
works in Safari, in an iframe and on any static host — and it supports
stepping backwards, which a live-pausing debugger cannot.

`LiveDebugger` really pauses the interpreter mid-run at each stop, blocking
synchronously (via `Atomics.wait`, in a JS function the worker injects as
`_pause_sync`) until the UI sends a resume command. This needs cross-origin
isolation (COOP/COEP + SharedArrayBuffer) — see start_live_debug's caller in
python.worker.ts for the availability check and the recording fallback.
"""

import bdb
import json
import linecache
import sys

DEBUG_FILE = "<margin-debug>"
MAX_STEPS = 5000
MAX_VALUE = 120

# Tracing into library internals is both useless to the user and ruinously slow
# under WebAssembly, so those frames are skipped entirely.
SKIP = ["pandas.*", "numpy.*", "matplotlib.*", "importlib.*", "json.*", "bdb"]


def _short(value):
    try:
        text = repr(value)
    except Exception as exc:
        return f"<unrepresentable: {type(exc).__name__}>"
    if len(text) > MAX_VALUE:
        return text[:MAX_VALUE] + "…"
    return text


def _snapshot(frame, reason):
    """{line, reason, func, scope, stack} for a single real pause — the shape
    both the recording and the live driver report a stop in."""
    stack = []
    f = frame
    while f is not None and f.f_code.co_filename == DEBUG_FILE:
        stack.append({"name": f.f_code.co_name, "line": f.f_lineno})
        f = f.f_back
    return {
        "line": frame.f_lineno,
        "reason": reason,
        "func": frame.f_code.co_name,
        "scope": [
            [name, _short(value)]
            for name, value in frame.f_locals.items()
            if not name.startswith("__")
        ],
        "stack": stack,
    }


class RecordingDebugger(bdb.Bdb):
    """Walks the script one line at a time, appending each stop to `trace`."""

    def __init__(self):
        super().__init__(skip=SKIP)
        self.trace = []
        self.truncated = False

    def _record(self, frame, reason):
        if len(self.trace) >= MAX_STEPS:
            self.truncated = True
            raise bdb.BdbQuit
        self.trace.append(_snapshot(frame, reason))

    def user_line(self, frame):
        if frame.f_code.co_filename != DEBUG_FILE:
            return
        self._record(frame, "line")
        self.set_step()

    def user_return(self, frame, value):
        if frame.f_code.co_filename != DEBUG_FILE:
            return
        self._record(frame, "return")
        self.set_step()

    def user_exception(self, frame, exc_info):
        if frame.f_code.co_filename != DEBUG_FILE:
            return
        self._record(frame, "exception")
        self.set_step()


class LiveDebugger(bdb.Bdb):
    """Really pauses the running interpreter, instead of recording a replay.

    At each stop, `_pause_sync` (a JS function bound in by the worker) posts
    the paused state to the main thread and then *synchronously blocks* the
    whole worker thread on `Atomics.wait`, until the main thread writes a
    resume command into the shared control buffer and calls `Atomics.notify`.
    Because that block happens inside a plain JS function call made from
    Python via Pyodide's FFI, CPython's own C stack is frozen along with it —
    this is a genuine pause, not a UI illusion.
    """

    def __init__(self):
        super().__init__(skip=SKIP)

    def _pause(self, frame, reason):
        state = json.dumps(_snapshot(frame, reason))
        cmd = json.loads(_pause_sync(state))  # noqa: F821 - injected by the worker
        kind = cmd.get("cmd")
        if kind == "continue":
            self.set_continue()
        elif kind == "step":
            self.set_step()
        elif kind == "next":
            self.set_next(frame)
        elif kind == "out":
            self.set_return(frame)
        elif kind == "stop":
            self.set_quit()
        if "breakpoints" in cmd:
            self.clear_all_breaks()
            for line in cmd["breakpoints"]:
                self.set_break(DEBUG_FILE, line)

    def user_line(self, frame):
        if frame.f_code.co_filename != DEBUG_FILE:
            return
        self._pause(frame, "line")

    def user_return(self, frame, value):
        if frame.f_code.co_filename != DEBUG_FILE:
            return
        self._pause(frame, "return")

    def user_exception(self, frame, exc_info):
        if frame.f_code.co_filename != DEBUG_FILE:
            return
        self._pause(frame, "exception")


def start_live_debug(source, breakpoints):
    """Run `source` for real, pausing at breakpoints (and, once stepping,
    at every subsequent line) until the script finishes or is stopped.

    Deliberately does not set an initial run mode: after `Bdb.reset()`
    (called inside `run()`), `stopframe` is `None`, which makes `stop_here`
    true unconditionally — so the very first pause is always at line 1,
    matching "paused at entry" in most real debuggers. The first resume
    command from the UI (typically "continue") takes it from there.
    """
    _reset_work_modules()  # noqa: F821 - defined in margin_runtime.py, same globals
    linecache.cache[DEBUG_FILE] = (len(source), None, source.splitlines(True), DEBUG_FILE)
    debugger = LiveDebugger()
    for line in breakpoints:
        debugger.set_break(DEBUG_FILE, line)
    globals_dict = {"__name__": "__main__", "__file__": "main.py"}

    error = None
    try:
        code = compile(source, DEBUG_FILE, "exec")
        debugger.run(code, globals_dict)
    except bdb.BdbQuit:
        pass
    except SyntaxError as exc:
        error = {"etype": type(exc).__name__, "message": str(exc.msg), "line": exc.lineno}
    except BaseException as exc:  # noqa: BLE001 - user code may raise anything
        error = {"etype": type(exc).__name__, "message": str(exc), "line": None}

    return json.dumps({"error": error})


def record_trace(source):
    """Run `source` under the debugger and return its full recorded trace."""
    linecache.cache[DEBUG_FILE] = (len(source), None, source.splitlines(True), DEBUG_FILE)
    debugger = RecordingDebugger()
    globals_dict = {"__name__": "__main__", "__file__": "main.py"}

    error = None
    # The recorder's whole job is to observe the script's own behaviour, so a
    # crash in user code is data, not a failure — capture it and keep the
    # trace up to that point.
    try:
        code = compile(source, DEBUG_FILE, "exec")
        debugger.run(code, globals_dict)
    except bdb.BdbQuit:
        pass
    except SyntaxError as exc:
        error = {"etype": type(exc).__name__, "message": str(exc.msg), "line": exc.lineno}
    except BaseException as exc:  # noqa: BLE001 - user code may raise anything
        error = {"etype": type(exc).__name__, "message": str(exc), "line": None}

    return json.dumps({
        "trace": debugger.trace,
        "truncated": debugger.truncated,
        "error": error,
        "python": sys.version.split()[0],
    })
