import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    allowedHosts: ['dvsa.elaman-group.com'],
    proxy: {
      '/api': 'http://localhost:5001'
    }
  }
})
