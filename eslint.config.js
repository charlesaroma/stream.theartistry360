import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import pluginQuery from '@tanstack/eslint-plugin-query'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Layering, enforced rather than described.
 *
 * component → query hook → service → api. Each layer knows the one below it
 * and nothing above. Hooks, services and api all live in src/store/
 * (docs/07-state-management.md); fixtures in src/data are read by services
 * only.
 */
const TRANSPORT = {
  group: ['@/store/tanstackStore/services/api/**', '**/api/client', '**/api/mock', '**/api/tokens'],
  message: 'UI talks to a query hook, never to the transport.',
}
const SERVICES = {
  group: ['@/store/tanstackStore/services/**'],
  message: 'UI reads and writes through src/store/tanstackStore/queries/ (site or member), never a service directly.',
}
const DATA = {
  group: ['@/data/*', '**/data/*'],
  message: 'Fixtures are read through src/store/tanstackStore/services/, never imported by UI.',
}

export default defineConfig([
  globalIgnores(['dist', '.agents']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // The store layer is TypeScript.
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // TanStack Query's own rules: stable clients, exhaustive keys, no rest
  // destructuring of query results.
  pluginQuery.configs['flat/recommended'],

  { files: ['vite.config.js'], languageOptions: { globals: globals.node } },

  // UI: pages, components, hooks, routes and utils.
  {
    files: ['src/pages/**/*.{js,jsx}', 'src/components/**/*.{js,jsx}', 'src/hooks/**/*.{js,jsx}',
            'src/routes/**/*.{js,jsx}', 'src/utils/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [TRANSPORT, SERVICES, DATA] }],
    },
  },

  // Query factories sit above services and below every screen.
  {
    files: ['src/store/tanstackStore/queries/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          DATA,
          { group: ['@/pages/**', '@/components/**'], message: 'Queries know services, never screens.' },
        ],
      }],
    },
  },

  // The transport must stay ignorant of the domain and of React.
  {
    files: ['src/store/tanstackStore/services/api/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['react', 'react-*', '@/store/tanstackStore/services/**', '!@/store/tanstackStore/services/api/**',
                  '@/store/tanstackStore/queries/**', '@/store/context/**', '@/pages/*', '@/components/*'],
          message:
            'The transport (store/tanstackStore/services/api) is the bottom layer. Importing a service, a component or React inverts the dependency.',
        }],
      }],
    },
  },
])
