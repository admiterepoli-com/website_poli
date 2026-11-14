import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Legacy site files are not linted; they are deleted as pages get ported.
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'legacy/',
      'functions/',
      'public/',
      '.visual/',
      '.github/',
      '**/*.d.ts',
      '*.js',
      '!eslint.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  {
    rules: {
      // TypeScript already reports undefined names.
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
);
