// frontend/vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT
  }
})
