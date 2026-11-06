import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const dominio = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    define: {
      global: 'globalThis', // necesario para sockjs-client (WebSocket)
    },
    server: {
      proxy: {
        '/api': dominio, // proxy al backend
        '/ws-notifications': {
          target: dominio,
          ws: true, // habilita el proxy de WebSocket
        },
      },
    },
  }
})
