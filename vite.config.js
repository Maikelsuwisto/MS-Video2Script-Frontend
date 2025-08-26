import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'CrossOriginIsolationPlugin',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          next()
        })
      }
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
