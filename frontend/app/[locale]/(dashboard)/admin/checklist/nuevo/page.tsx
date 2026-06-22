import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { NuevaPlantillaPage } from '@/features/checklist/NuevaPlantillaPage'

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  const { data: perfil } = await supabase.from('usuario').select('nombre, rol').eq('auth_id', user.id).single()
  if (!perfil || !['admin_apoyo', 'director'].includes(perfil.rol)) redirect(`/${locale}`)
  return <NuevaPlantillaPage locale={locale} rol={perfil.rol as 'admin_apoyo' | 'director'} nombre={perfil.nombre} basePath={`/${locale}/admin/checklist`} />
}
