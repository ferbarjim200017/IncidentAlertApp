import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  define: {
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_REF': JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF || '')
  }
})
