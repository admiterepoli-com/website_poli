import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Generated output, dependencies, the separately linted Cloud Functions, static files.
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
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
      // Strictness that must not erode (#84): no `any`, no silenced type errors, no `!` that hides
      // a real null, and no type assertions in object literals that bypass excess-property checks.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],
    },
  },
);
