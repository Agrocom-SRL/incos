import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Reglas del React Compiler (eslint-plugin-react-hooks v6+) en `warn`: el código usa
      // refs como caché/"latest ref" leídos durante render (providers de matrícula, becas,
      // pagos, wizard) y memoizaciones manuales. Reescribirlos es de riesgo (flujos de
      // registro/pagos) y se abordará por módulo; mientras tanto no bloquean el CI.
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/use-memo': 'warn',
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        // Parámetros posicionales sin usar son legítimos (contratos de interfaz en
        // domain/repositories, firmas de callbacks, API estable de hooks): no se marcan.
        args: 'none',
        // `catch (e)` / `catch (_)` sin usar el error es un idiom aceptado.
        caughtErrors: 'none',
      }],
    },
  },
  {
    // Pruebas (Vitest sin globals: se importa de 'vitest') y setup de pruebas.
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Los routes.jsx definen wrappers locales y exportan el array de rutas: no son
    // módulos de componentes, Fast Refresh no aplica.
    files: ['**/routes.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
