import js from "@eslint/js";
import tseslint from 'typescript-eslint'
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default tseslint.config(
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser
      },
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json"
      },
    },
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.base
    ],
    plugins: {},
    rules: {
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      'no-unused-labels': 'off',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'eqeqeq': 'error'
    },
  },
  {
    ignores: [],
  },
)