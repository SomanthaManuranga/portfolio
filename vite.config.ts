import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://somanthamanuranga.github.io/portfolio/
// Override with BASE_PATH=/ when deploying to a root domain (Netlify, Vercel, custom domain).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/portfolio/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
