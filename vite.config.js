import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function normaliseBase(value) {
  if (!value || value === './') return './';

  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  base: normaliseBase(process.env.BUILD_TARGET_URL_PATH),
  publicDir: 'static',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
