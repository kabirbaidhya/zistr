import js from '@eslint/js';
import turboPlugin from 'eslint-plugin-turbo';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * A shared ESLint configuration for the repository.
 *
 * */
export const config = defineConfig([
  // Ignore build and node_modules globally
  globalIgnores(['dist', 'node_modules']),
  {
    // Only lint backend folder
    files: ['**/*.{ts,js}'],
    extends: [
      js.configs.recommended, // Base JS rules
      tseslint.configs.recommended, // TypeScript rules
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node, // Node environment globals
        ...globals.jest, // <-- Add Jest globals here
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
]);
