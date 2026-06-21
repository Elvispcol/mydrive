import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { EditarMantenimientoPage } from '@/features/mantenimientos/EditarMantenimientoPage'

export default async function Page({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase.from('usuario').select('nombre, rol').eq('auth_id', user.id).single()
  if (!perfil || perfil.rol !== 'admin_apoyo') redirect(`/${locale}`)

  return (
    <EditarMantenimientoPage
      mantenimientoId={id}
      locale={locale}
      rol="admin_apoyo"
      nombre={perfil.nombre}
      basePath={`/${locale}/admin/mantenimientos`}
    />
  )
}
