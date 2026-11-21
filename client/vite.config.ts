/**
 * File: vite.config.ts
 * Purpose: Enables React and Tailwind and forwards local API requests to Django.
 * !!! TODO: Review deployment/API connection settings. [SD]
 */

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
