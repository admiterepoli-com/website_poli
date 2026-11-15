import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // lib/ is build output; src/legacy.js is the untouched legacy handler file.
    ignores: ['lib/', 'node_modules/', 'src/legacy.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      // TypeScript already reports undefined names.
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
);
