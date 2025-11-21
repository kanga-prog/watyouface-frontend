import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // ✅ Corrige l'erreur "global is not defined"
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <- ajoute ça
    },
  },
});
