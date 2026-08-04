import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// RTL's own auto-cleanup only registers itself when it finds a global
// `afterEach` (i.e. `test.globals: true`); this project imports test
// functions explicitly instead, so unmounting between tests needs doing here.
afterEach(() => cleanup())

// Node 22+ ships its own global `localStorage`, and on this Node version
// jsdom's `window.localStorage` turns out to be that same native object
// rather than jsdom's own Storage implementation — missing even `.clear()`
// when no `--localstorage-file` is configured. Rather than depend on Node
// flags some future test runner invocation might not pass, replace it with a
// small in-memory Storage of our own: this project's code only needs a
// working getItem/setItem/removeItem/clear, not real persistence.
class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
})
