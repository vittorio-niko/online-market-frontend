import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': 'http://market.local',
      '/user': 'http://market.local',
      '/users': 'http://market.local',
      '/admin': 'http://market.local',
    }
  }
});