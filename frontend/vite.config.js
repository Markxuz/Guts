import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || 0) || undefined;

  return {
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
      host: true,
      port: 5173,
      watch: {
        usePolling: true,
      },
      ...(hmrClientPort ? { hmr: { clientPort: hmrClientPort } } : {}),
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true
        }
      }
    }
  };
})