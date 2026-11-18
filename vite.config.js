import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages phục vụ app ở đường dẫn con /japanesestudy/
  base: '/japanesestudy/',
  test: {
    environment: 'jsdom',
  },
});
