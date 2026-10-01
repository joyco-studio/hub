import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve('tests/image-sequence/browser'),
  resolve: {
    alias: { '@': resolve('.context/image-sequence-install') },
    dedupe: ['react', 'react-dom'],
  },
  esbuild: { jsx: 'automatic' },
  server: { port: 4178, strictPort: true, fs: { allow: [resolve('.')] } },
  // This fixture intentionally has no Hub CSS or application providers.
  css: { postcss: { plugins: [] } },
})
