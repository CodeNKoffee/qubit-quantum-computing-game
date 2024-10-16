import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false // disable error overlay if you find it distracting
    }
  },
  optimizeDeps: {
    exclude: ['/public/models/'] // Exclude the models directory from optimization and analysis
  },
  build: {
    rollupOptions: {
      external: ['/public/models/'] // Prevent Vite from bundling files in the models directory
    }
  }
})