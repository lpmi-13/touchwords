import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function normaliseBase(value) {
  if (!value || value === './') return './';

  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  base: normaliseBase(process.env.BUILD_TARGET_URL_PATH),
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{html,js,css,ico,png,jpg,fnt}'],
      },
    }),
  ],
});
