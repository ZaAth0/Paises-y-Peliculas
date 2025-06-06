import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: '.', // Asegura que el root es el mismo que donde está este archivo
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    open: true
  }
})
