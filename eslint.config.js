import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

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

  /**
   * Layering, enforced rather than described.
   *
   * component → hook → service → api. Each layer knows the one below it and
   * nothing above. Fixtures in src/data are read by services only.
   */
  {
    files: ['src/pages/**/*.{js,jsx}', 'src/components/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/api/*', '**/api/client', '**/api/mock', '**/api/tokens'],
            message:
              'UI talks to a service, never to the transport. Add or reuse a function in src/services/ and call that.',
          },
          {
            group: ['@/data/*', '**/data/*'],
            message: 'Fixtures are read through src/services/, never imported by UI.',
          },
        ],
      }],
    },
  },

  // The transport must stay ignorant of the domain and of React.
  {
    files: ['src/api/**/*.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['react', 'react-*', '@/services/**', '@/pages/*', '@/components/*'],
          message:
            'src/api is the bottom layer. Importing a service, a component or React inverts the dependency.',
        }],
      }],
    },
  },
])
