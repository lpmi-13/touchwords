import { defineConfig } from 'eslint/config';

const browserGlobals = {
  cancelAnimationFrame: 'readonly',
  document: 'readonly',
  HTMLElement: 'readonly',
  matchMedia: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  ResizeObserver: 'readonly',
  window: 'readonly',
};

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserGlobals,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
    },
  },
  {
    files: ['tests/**/*.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { process: 'readonly' },
    },
  },
]);
