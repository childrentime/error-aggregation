import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sourceMap from './plugins/sourcemap'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sourceMap()],
  build: {
    sourcemap: 'hidden'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
