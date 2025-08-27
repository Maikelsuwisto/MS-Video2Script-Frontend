import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../build', // output build directly into backend/build
  },
  preview: {
    port: process.env.PORT || 4173,
    host: true,
  },
  server: {
    port: process.env.PORT || 5173,
    host: true,
  }
})
