import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { VehiculoDetallePage } from '@/features/vehiculos/VehiculoDetallePage'

export default async function AdminVehiculoDetallePage({
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

  if (!perfil || !['admin_apoyo', 'director'].includes(perfil.rol)) {
    redirect(`/${locale}`)
  }

  return (
    <VehiculoDetallePage
      vehiculoId={id}
      locale={locale}
      tab={tab}
      backHref={`/${locale}/admin/vehiculos`}
      rol={perfil.rol as 'admin_apoyo' | 'director'}
      nombre={perfil.nombre}
    />
  )
}
