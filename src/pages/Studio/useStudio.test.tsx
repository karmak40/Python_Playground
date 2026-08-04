import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../i18n/I18nProvider'
import { useStudio } from './useStudio'

// A faithful-enough stand-in for the real PythonClient: each request method
// is a bare mock a test configures directly, and `terminate()` rejects
// whatever's still pending — exactly what the real class does via its
// `failAll()` (see src/lib/python/client.ts) — since useStudio's stall
// watchdog and Stop button both depend on that contract to recover a hung
// request. Built inside `vi.hoisted` because `vi.mock`'s factory is hoisted
// above the rest of this file, so a plain top-level class would be used
// before it's initialized.
const { MockPythonClient } = vi.hoisted(() => {
  class MockPythonClient {
    static instances: MockPythonClient[] = []
    listeners!: { onEvent: (e: unknown) => void; onProgress: (e: unknown) => void; onPause: (e: unknown) => void }
    run = vi.fn()
    startLiveDebug = vi.fn()
    installPackage = vi.fn()
    upload = vi.fn()
    removeFile = vi.fn()
    listFiles = vi.fn(async () => [])
    resumeLiveDebug = vi.fn()
    private pendingRejects: Array<(e: Error) => void> = []
    terminate = vi.fn(() => {
      const rejects = this.pendingRejects.splice(0)
      rejects.forEach((reject) => reject(new Error('Python runtime stopped')))
    })

    constructor(listeners: MockPythonClient['listeners']) {
      this.listeners = listeners
      MockPythonClient.instances.push(this)
    }

    /** A request that hangs until something calls terminate() — the shape of
     * a genuinely stalled CDN request, not a normal success/failure. */
    hang() {
      return new Promise((_resolve, reject) => {
        this.pendingRejects.push(reject)
      })
    }
  }
  return { MockPythonClient }
})

vi.mock('../../lib/python/client', () => ({
  PythonClient: MockPythonClient,
  liveDebugAvailable: vi.fn(() => true),
}))

function currentClient() {
  return MockPythonClient.instances[MockPythonClient.instances.length - 1]
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}

beforeEach(() => {
  MockPythonClient.instances = []
  localStorage.clear()
})

describe('useStudio run()', () => {
  it('streams real output and lands on a finished state', async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    client.run.mockImplementation(async () => {
      client.listeners.onEvent({ t: 'out', runId: 1, stream: 'stdout', line: 6, text: '(248, 4)\n' })
      return { status: 'ok', elapsedMs: 42, packages: ['pandas'], python: '3.14.2' }
    })

    await act(() => result.current.run())

    expect(result.current.state.running).toBe(false)
    expect(result.current.state.outputs.get(6)).toEqual([{ kind: 'val', text: '(248, 4)' }])
    expect(result.current.state.meta).toBe('42 ms')
    expect(result.current.state.error).toBeNull()
  })

  it('surfaces a real failure instead of a fake success', async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    client.run.mockRejectedValue(new Error("NameError: name 'df' is not defined"))

    await act(() => result.current.run())

    expect(result.current.state.running).toBe(false)
    expect(result.current.state.error?.message).toBe("NameError: name 'df' is not defined")
  })

  it("won't run twice at once", async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    let resolveRun: (value: { status: string; elapsedMs: number; packages: string[]; python: string }) => void
    client.run.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRun = resolve
        }),
    )

    act(() => {
      void result.current.run()
    })
    expect(result.current.state.running).toBe(true)
    // A second call while one is in flight must not re-enter — otherwise two
    // concurrent runs would race over the same output map.
    await act(() => result.current.run())
    expect(client.run).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveRun({ status: 'ok', elapsedMs: 1, packages: [], python: '3.14' })
    })
  })

  it('Stop hard-resets a run in flight instead of leaving it stuck', async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    client.run.mockImplementation(() => client.hang())

    let runPromise: Promise<void>
    act(() => {
      runPromise = result.current.run()
    })
    expect(result.current.state.running).toBe(true)

    act(() => result.current.stop())
    await act(() => runPromise)

    expect(client.terminate).toHaveBeenCalled()
    expect(result.current.state.running).toBe(false)
  })
})

describe('useStudio stall watchdog', () => {
  beforeEach(() => vi.useFakeTimers())

  it('kills a genuinely stalled request and reports it honestly', async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    client.run.mockImplementation(() => client.hang())

    let runPromise: Promise<void>
    act(() => {
      runPromise = result.current.run()
    })
    expect(result.current.state.running).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(12_000)
    })
    expect(result.current.state.slow).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(33_000) // total 45s: the hard-kill threshold
    })
    await act(() => runPromise)

    expect(client.terminate).toHaveBeenCalled()
    expect(result.current.state.running).toBe(false)
    expect(result.current.state.error?.message).toBe(result.current.state.error?.message)
    expect(result.current.state.error?.message).toMatch(/taking too long/i)
  })

  it('never fires once real execution has begun, however long the script runs', async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    let resolveRun: (value: { status: string; elapsedMs: number; packages: string[]; python: string }) => void
    client.run.mockImplementation((..._args) => {
      // Mirrors the worker: it posts 'executing' once packages are resolved,
      // then the user's own (potentially slow) code runs.
      client.listeners.onProgress({ phase: 'executing', detail: '' })
      return new Promise((resolve) => {
        resolveRun = resolve
      })
    })

    act(() => {
      void result.current.run()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000) // well past the 45s kill window
    })

    expect(client.terminate).not.toHaveBeenCalled()
    expect(result.current.state.running).toBe(true)

    await act(async () => {
      resolveRun({ status: 'ok', elapsedMs: 120_000, packages: [], python: '3.14' })
    })
  })
})

describe('useStudio installPackage()', () => {
  it('surfaces the real installer message', async () => {
    const { result } = renderHook(() => useStudio(), { wrapper })
    const client = currentClient()
    client.installPackage.mockResolvedValue({ ok: false, message: 'toolz has no pure-Python wheel', packages: [] })

    const outcome = await act(() => result.current.installPackage('toolz'))

    expect(outcome).toEqual({ ok: false, message: 'toolz has no pure-Python wheel' })
  })
})
