import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const fs    = require('fs')
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    https: {
      key:  fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem'),
    },
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
