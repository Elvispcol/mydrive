import { redirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

// Raíz sin locale: el proxy.ts redirige automáticamente,
// pero este fallback garantiza que siempre lleguemos a una ruta válida.
export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
