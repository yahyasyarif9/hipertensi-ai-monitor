import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Semua request /api diteruskan ke server Express (Haidar). Ubah port jika berbeda.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
