import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tauri-vendor': ['@tauri-apps/api', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-store'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: true,
    },
  },
})
