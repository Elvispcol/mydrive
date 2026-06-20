import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      // No bloquear por variables/imports sin usar (ruidoso en proyectos en evolución)
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // El cliente Supabase usa any sin tipos generados — aceptable hasta supabase gen types
      '@typescript-eslint/no-explicit-any': 'off',
      // Patrón mounted guard (useState+useEffect) para evitar hydration mismatch
      // en componentes Recharts — la regla react-compiler no aplica aquí
      'react-compiler/react-compiler': 'off',
    },
  },
]
