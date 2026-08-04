"""Margin's Python-side runtime.

Installed once per worker boot. Owns everything that has to happen inside
CPython rather than in JS: attributing output to the source line that
produced it, displaying bare expression results, formatting tracebacks
against the user's own source, and turning matplotlib figures into bytes.

`_emit` and `_emit_figure` are JS callbacks injected by the worker; they are
the only channel back to the main thread.
"""

import ast
import io
import json
import linecache
import os
import sys
import time
import traceback

USER_FILE = "<margin>"
MAX_REPR = 400


def _send(kind, payload):
    """Hand a message to JS as a JSON string.

    Passing the dict directly would reach JS as a PyProxy, which structured
    clone cannot serialise across the worker boundary — and whose lifetime we
    would then have to manage by hand. JSON sidesteps both problems.
    """
    _emit(kind, json.dumps(payload))


def _user_line():
    """Line number of the innermost frame belonging to the user's script.

    Walking innermost-first is what gives the margin its semantics: a print()
    inside a user-defined function attributes to the line inside the function,
    while output from deep inside a library attributes to the user's call site.
    """
    frame = sys._getframe(1)
    while frame is not None:
        if frame.f_code.co_filename == USER_FILE:
            return frame.f_lineno
        frame = frame.f_back
    return None


class MarginStream(io.TextIOBase):
    """Replaces sys.stdout/stderr, tagging each completed line with its origin."""

    def __init__(self, name):
        self._name = name
        self._buf = {}

    def writable(self):
        return True

    def write(self, s):
        line = _user_line()
        self._buf.setdefault(line, []).append(s)
        # print() writes the value and the newline as separate calls; only
        # flush once a full line exists so they arrive as one margin entry.
        if "\n" in s:
            self._flush_line(line)
        return len(s)

    def _flush_line(self, line):
        text = "".join(self._buf.pop(line, []))
        if text:
            _send("out", {"stream": self._name, "line": line, "text": text})

    def flush(self):
        for line in list(self._buf):
            self._flush_line(line)


def _truncate(text):
    if len(text) > MAX_REPR:
        return text[:MAX_REPR] + "…"
    return text


def _safe_repr(value):
    try:
        return _truncate(repr(value))
    except Exception as exc:
        return f"<unrepresentable: {type(exc).__name__}>"


def _describe(value):
    """A short type/shape summary for the State panel.

    Deliberately avoids repr() for large containers: repr of a big DataFrame
    is both slow and useless in a 300px panel.
    """
    type_name = type(value).__name__
    shape = getattr(value, "shape", None)
    if isinstance(shape, tuple):
        if len(shape) == 2:
            return type_name, f"{shape[0]} rows × {shape[1]} columns"
        if len(shape) == 1:
            return type_name, f"{shape[0]} values"
        # 0-d arrays and numpy scalars have shape () and are just one number;
        # str() avoids numpy 2's noisy "np.float64(...)" repr.
        if len(shape) == 0:
            return type_name, _truncate(str(value))
        return type_name, f"shape {shape}"
    if isinstance(value, (list, tuple, set, dict, frozenset)):
        return type_name, f"{len(value)} items"
    if isinstance(value, str):
        return type_name, _truncate(f"{len(value)} chars · {value!r}")
    return type_name, _safe_repr(value)


def _clean_html(html):
    """Drop the <style>/<script> blocks pandas bakes into _repr_html_.

    Its stylesheet targets a Jupyter notebook's layout and would otherwise
    render as literal text in the margin — the margin does its own styling.
    """
    if not html:
        return None
    for tag in ("style", "script"):
        while True:
            start = html.lower().find(f"<{tag}")
            if start == -1:
                break
            end = html.lower().find(f"</{tag}>", start)
            if end == -1:
                html = html[:start]
                break
            html = html[:start] + html[end + len(tag) + 3 :]
    return html.strip()


def __margin_display__(value, lineno):
    """Show the value of a bare top-level expression, then pass it through."""
    if value is None:
        return value
    html = None
    repr_html = getattr(value, "_repr_html_", None)
    if callable(repr_html):
        try:
            html = _clean_html(repr_html())
        except Exception:
            html = None
    _send("value", {"line": lineno, "repr": _safe_repr(value), "html": html})
    return value


def _instrument(tree):
    """Wrap bare top-level expressions so their value shows in the margin."""
    for node in tree.body:
        if isinstance(node, ast.Expr) and not isinstance(node.value, ast.Constant):
            node.value = ast.Call(
                func=ast.Name(id="__margin_display__", ctx=ast.Load()),
                args=[node.value, ast.Constant(value=node.lineno)],
                keywords=[],
            )
    ast.fix_missing_locations(tree)
    return tree


def _install_matplotlib_hook(source=""):
    """Make plt.show() emit real image bytes instead of trying to open a window.

    Imported and patched *before* the user's code runs, so that their own
    `import matplotlib.pyplot as plt` picks the already-patched module out of
    sys.modules. Pyodide's browser backends need `document`, which does not
    exist in a worker, so Agg is the only usable backend here.
    """
    if "matplotlib" not in sys.modules and "matplotlib" not in source:
        return
    try:
        import matplotlib

        matplotlib.use("agg")
        import matplotlib.pyplot as plt
    except Exception:
        return
    if getattr(plt, "_margin_patched", False):
        return

    def emit_figure(fig, line):
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=144, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        _emit_figure(line, "image/png", buf.getvalue())

    def show(*_args, **_kwargs):
        line = _user_line()
        for num in plt.get_fignums():
            emit_figure(plt.figure(num), line)
        plt.close("all")

    plt.show = show
    plt._margin_patched = True


def _dataframe_columns(globals_dict):
    """Column names of any DataFrame in scope, for the error panel's hint."""
    names = []
    for value in globals_dict.values():
        columns = getattr(value, "columns", None)
        if columns is None:
            continue
        try:
            names.extend(str(c) for c in columns)
        except Exception:
            continue
    return list(dict.fromkeys(names))


def _report_error(exc, globals_dict):
    """Format a traceback against the user's own source and locate the fault."""
    if isinstance(exc, SyntaxError) and exc.filename == USER_FILE:
        _send("error", {
            "etype": type(exc).__name__,
            "message": str(exc.msg),
            "line": exc.lineno,
            "traceback": "".join(traceback.format_exception_only(type(exc), exc)),
            "columns": [],
        })
        return

    tb = exc.__traceback__
    # Drop our own runner frames so the traceback starts at the user's code.
    while tb is not None and tb.tb_frame.f_code.co_filename != USER_FILE:
        tb = tb.tb_next

    frames = traceback.extract_tb(tb)
    user_frames = [f for f in frames if f.filename == USER_FILE]
    _send("error", {
        "etype": type(exc).__name__,
        "message": str(exc),
        "line": user_frames[-1].lineno if user_frames else None,
        "traceback": "".join(traceback.format_exception(type(exc), exc, tb)),
        "columns": _dataframe_columns(globals_dict) if isinstance(exc, KeyError) else [],
    })


def _reset_work_modules():
    """Drop cached imports of the user's own project files.

    Without this, editing helpers.py and re-running main.py would still see
    the *previous* helpers.py — Python only imports a module once per
    interpreter lifetime, and this interpreter persists across runs.
    Anything under /work is a project file the user can edit; stdlib and
    site-packages modules live elsewhere and are left alone.
    """
    stale = [
        name
        for name, mod in sys.modules.items()
        if str(getattr(mod, "__file__", "") or "").startswith("/work/")
    ]
    for name in stale:
        del sys.modules[name]


def run_user_code(source):
    """Execute the user's script, streaming output/values/figures/errors."""
    _reset_work_modules()
    # linecache is what lets traceback print the offending source line; without
    # it a traceback shows the filename and line number but no code.
    linecache.cache[USER_FILE] = (len(source), None, source.splitlines(True), USER_FILE)

    globals_dict = {
        "__name__": "__main__",
        "__file__": "main.py",
        "__margin_display__": __margin_display__,
    }

    stdout, stderr = MarginStream("stdout"), MarginStream("stderr")
    prev_out, prev_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout, stderr

    started = time.time()
    status = "ok"
    try:
        _install_matplotlib_hook(source)
        tree = ast.parse(source, filename=USER_FILE, mode="exec")
        code = compile(_instrument(tree), USER_FILE, "exec")
        exec(code, globals_dict)
    except SyntaxError as exc:
        status = "error"
        _report_error(exc, globals_dict)
    except KeyboardInterrupt:
        status = "interrupted"
    except BaseException as exc:  # noqa: BLE001 - user code may raise anything
        status = "error"
        _report_error(exc, globals_dict)
    finally:
        stdout.flush()
        stderr.flush()
        sys.stdout, sys.stderr = prev_out, prev_err

    _emit_vars(globals_dict)
    return json.dumps({"status": status, "elapsedMs": int((time.time() - started) * 1000)})


def _emit_vars(globals_dict):
    variables = []
    for name, value in globals_dict.items():
        if name.startswith("__") or name == "__margin_display__":
            continue
        if callable(value) or type(value).__name__ == "module":
            continue
        type_name, summary = _describe(value)
        variables.append({"name": name, "type": type_name, "val": summary})
    _send("vars", {"vars": variables})


async def install_from_pypi(name):
    """Installs a real package from PyPI at runtime, for pure-Python wheels.

    micropip resolves dependencies and validates against the PyPI JSON API;
    it can only install pure-Python (or Pyodide-built wasm) wheels, so a
    package with compiled C extensions not built for Emscripten (most of the
    scientific stack outside Pyodide's own bundled set) will raise here —
    that failure is real and gets surfaced to the user as-is, not swallowed.
    """
    import micropip

    await micropip.install(name)
    return json.dumps({"ok": True})


def bootstrap():
    """Idempotent per-worker setup: working dir, matplotlib backend."""
    os.makedirs("/work", exist_ok=True)
    os.chdir("/work")
    os.environ.setdefault("MPLBACKEND", "agg")
    return json.dumps({"python": sys.version.split()[0], "cwd": os.getcwd()})
