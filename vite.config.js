import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname),
  logLevel: 'error',
  cacheDir: path.resolve(__dirname, 'node_modules/.vite'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    target: 'esnext'
  },
  plugins: [
    react()
  ]
});
