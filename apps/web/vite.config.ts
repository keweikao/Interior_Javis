import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@q-check/construction-knowledge': path.resolve(
        __dirname,
        '../../packages/construction-knowledge/src/index.ts'
      ),
    },
  },
})
