import { defineConfig } from 'vite';

export default defineConfig({
  base: '/planets/',
  build: {
    rollupOptions: {
      input: { overview: 'index.html', mars: 'mars/index.html' },
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
