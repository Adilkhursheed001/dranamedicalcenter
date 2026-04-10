import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = process.env.VITE_API_URL || 'https://dr-ana-backend.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/login':        BACKEND,
      '/auth':         BACKEND,
      '/doctor':       BACKEND,
      '/book':         BACKEND,
      '/my-appointments': BACKEND,
      '/appointments': BACKEND,
      '/payment':      BACKEND,
      '/admin/appointments': BACKEND,
      '/admin/patients':     BACKEND,
      '/health':       BACKEND,
    },
  },
})
