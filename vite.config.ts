import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/portal/api': {
        target: 'https://trend-engine-backend-f55e.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
