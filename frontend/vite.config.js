import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/login': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',
      '/doctor': 'http://localhost:5000',
      '/book': 'http://localhost:5000',
      '/my-appointments': 'http://localhost:5000',
      '/appointments': 'http://localhost:5000',
      '/payment': 'http://localhost:5000',
      '/admin/appointments': 'http://localhost:5000',
      '/admin/patients': 'http://localhost:5000',
      '/admin/availability': 'http://localhost:5000',
    },
  },
})
