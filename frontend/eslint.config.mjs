// ESLint 9 flat config para Next.js 16
// FlatCompat causa error circular con el plugin de React — se usa
// configuración nativa. Las reglas de Next.js se aplican vía next lint.
import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',       // TypeScript se encarga de esto
      'no-redeclare': 'off',   // TypeScript se encarga de esto
    },
  },
]
