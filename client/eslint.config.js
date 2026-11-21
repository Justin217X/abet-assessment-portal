/**
 * File: eslint.config.js
 * Purpose: Sets the checks used to find frontend code problems.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([

  // Skip generated production files.
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],

      // Use the recommended JavaScript, TypeScript, and React checks.
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {

      // Recognize browser names such as window and document.
      globals: globals.browser,
    },
  },
])
