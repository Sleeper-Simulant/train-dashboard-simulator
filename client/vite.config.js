import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://server:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://server:3001',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
