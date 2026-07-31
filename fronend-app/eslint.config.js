import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['node_modules', '.expo', 'dist', 'android', 'ios']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        __DEV__: 'readonly',
      },
    },
    rules: {
      // This codebase doesn't use the React Compiler; the react-hooks v7
      // "recommended" set bundles its stricter compiler-readiness rules
      // (immutability/purity/set-state-in-effect/etc) as errors, which flags
      // a lot of pre-existing, working patterns that aren't actual bugs
      // today. Keep them visible as warnings rather than blocking on a
      // large, risky rewrite; `rules-of-hooks` (a real bug class) stays an error.
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
      // The codebase leans on `any` at API boundaries throughout; tightening
      // this incrementally (see Product/Cart/Order types) is tracked
      // separately rather than blocking lint on a codebase-wide pass.
      '@typescript-eslint/no-explicit-any': 'warn',
      // RN/Metro's static asset system (local images) relies on synchronous
      // `require()` calls — this isn't a CommonJS-vs-ESM issue to flag.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
])
