import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175
  },
  optimizeDeps: {
    include: ['ag-grid-community', 'ag-grid-vue3']
  }
})