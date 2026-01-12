import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    port: 4200,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '.',
    },
  },
});
