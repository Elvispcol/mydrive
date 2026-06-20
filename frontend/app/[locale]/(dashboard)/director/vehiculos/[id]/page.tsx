import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { VehiculoDetallePage } from '@/features/vehiculos/VehiculoDetallePage'

export default async function DirectorVehiculoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { locale, id } = await params
  const { tab = 'preoperacionales' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('nombre, rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'director') {
    redirect(`/${locale}`)
  }

  return (
    <VehiculoDetallePage
      vehiculoId={id}
      locale={locale}
      tab={tab}
      backHref={`/${locale}/director/vehiculos`}
      rol="director"
      nombre={perfil.nombre}
    />
  )
}
