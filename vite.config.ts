import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le proxy renvoie /api vers le serveur Express (port 3001),
// ce qui évite tout souci de CORS en développement.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
