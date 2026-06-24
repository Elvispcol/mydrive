import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { VehiculoListaPage } from '@/features/vehiculos/VehiculoListaPage'

export default async function DirectorVehiculosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('nombre, rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'director') redirect(`/${locale}`)

  return (
    <VehiculoListaPage
      locale={locale}
      rol="director"
      nombre={perfil.nombre}
      basePath={`/${locale}/director/vehiculos`}
      q={q}
    />
  )
}
