import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      build: {
        outDir: '../build', // output build into backend/build
      },
    }
  ],
  preview: {
    allowedHosts: ['.railway.app'], // allow all Railway subdomains
    port: process.env.PORT || 4173,
    host: true
  },
  server: {
    port: process.env.PORT || 5173,
    host: true
  }
})
