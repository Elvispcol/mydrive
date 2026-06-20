import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/lib/i18n/config'

export default async function LocaleRootPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil) redirect(`/${locale}/login`)

  switch (perfil.rol) {
    case 'director':    redirect(`/${locale}/director`)
    case 'admin_apoyo': redirect(`/${locale}/admin`)
    case 'conductor':   redirect(`/${locale}/conductor`)
    default:            redirect(`/${locale}/login`)
  }
}
