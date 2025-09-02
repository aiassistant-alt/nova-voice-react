import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Cambiar de 'dist' a 'build' para Azure Static Web Apps
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          aws: ['aws-amplify', '@aws-amplify/auth', '@aws-amplify/ui-react']
        }
      }
    }
  },
  server: {
    port: 5173
  }
})
