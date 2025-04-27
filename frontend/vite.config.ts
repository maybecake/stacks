import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      clientPort: 5173,  // Explicitly set HMR port
      protocol: 'ws',    // Use WebSocket for HMR
    },
    watch: {
      usePolling: true,  // Enable polling for file changes
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],  // Pre-bundle these dependencies
  },
  build: {
    sourcemap: true,     // Enable source maps for better debugging
  },
})
