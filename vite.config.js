import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dominio from './src/common/API';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // para sockjs-client sino no funca el websocket
  },
  server: {
    proxy: {
      '/api': dominio, // proxy pal backend
      '/ws-notifications': {
        target: dominio,
        ws: true, // !! para WebSocket
      }
    }
  }
})
