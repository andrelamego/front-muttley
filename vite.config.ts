import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // O Vite não põe o .env em process.env; loadEnv com prefixo '' lê API_PROXY_TARGET de lá.
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          // API_PROXY_TARGET=http://192.168.0.240:8090 usa a API do homelab (via nginx do web).
          target: env.API_PROXY_TARGET || 'http://localhost:8083',
          changeOrigin: true,
        },
      },
    },
  }
})
