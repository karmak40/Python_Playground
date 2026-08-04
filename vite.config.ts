import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Cross-origin isolation is required for SharedArrayBuffer, which the
// Python runtime worker needs for interrupting a running script and (later)
// for the live pausable debugger. All current subresources (Google Fonts,
// jsDelivr's Pyodide package wheels) already send
// Cross-Origin-Resource-Policy: cross-origin, so this is safe to enable now.
const crossOriginIsolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

const pyodideDir = normalizePath(dirname(fileURLToPath(import.meta.resolve('pyodide'))))
const pyodideAsset = (name: string) => normalizePath(join(pyodideDir, name))

// The npm package ships the runtime core but no package wheels, so the
// lockfile the worker loads has to be the CDN's — its URL is what Pyodide
// resolves wheel downloads against. Pin it to the exact installed version so
// the wheels always match the wasm runtime's ABI.
const pyodideVersion = JSON.parse(
  readFileSync(join(pyodideDir, 'package.json'), 'utf8'),
).version as string

export default defineConfig({
  plugins: [
    react(),
    // Pyodide's core runtime (wasm + stdlib) is served same-origin so it
    // stays COEP-safe without depending on a CDN for the base runtime.
    // Package wheels (pandas/numpy/matplotlib) still load lazily from
    // jsDelivr at runtime — see src/lib/python/python.worker.ts.
    viteStaticCopy({
      targets: [
        'pyodide.asm.wasm',
        'pyodide.asm.mjs',
        'python_stdlib.zip',
        'pyodide.mjs',
        'pyodide-lock.json',
      ].map((name) => ({
        src: pyodideAsset(name),
        dest: 'assets/pyodide',
        rename: { stripBase: true },
      })),
    }),
  ],
  define: { __PYODIDE_VERSION__: JSON.stringify(pyodideVersion) },
  server: { port: Number(process.env.PORT) || 5178, headers: crossOriginIsolationHeaders },
  preview: { headers: crossOriginIsolationHeaders },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['pyodide'] },
})
