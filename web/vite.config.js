import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En local, las llamadas a /api se reenvían a la API de FastAPI (puerto 8000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8000' },
  },
})
