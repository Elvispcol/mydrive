import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { NuevaMultaPage } from '@/features/multas/NuevaMultaPage'

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  const { data: perfil } = await supabase.from('usuario').select('nombre, rol').eq('auth_id', user.id).single()
  if (!perfil || perfil.rol !== 'director') redirect(`/${locale}`)
  return <NuevaMultaPage locale={locale} rol="director" nombre={perfil.nombre} basePath={`/${locale}/director/multas`} />
}
