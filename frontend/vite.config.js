import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  build: {
    // The PH address dataset is intentionally large and loaded in its own chunk.
    // Raise warning threshold so build output reflects real regressions instead of known data size.
    chunkSizeWarningLimit: 9000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react'],
          phAddress: ['latest-ph-address-thanks-to-anehan', 'psgc'],
        },
      },
    },
  },
  server: {
    host: true, // Kailangan ito para makita ng Windows browser ang loob ng Linux Docker
    port: 5173,
    watch: {
      usePolling: true, // PINAKA-IMPORTANTE para ma-detect ang file saves mula sa Windows
    },
    hmr: {
      clientPort: 8080, // Ituturo natin pabalik sa browser port para hindi maligaw
    },
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true
      }
    }
  }
})