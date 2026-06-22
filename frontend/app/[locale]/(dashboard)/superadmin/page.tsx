import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { listarOrganizaciones, getSuperadminPerfil } from '@/lib/services/superadmin'
import { OrgListaPage } from '@/features/superadmin/OrgListaPage'

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const admin = await getSuperadminPerfil(user.id)
  if (!admin) redirect(`/${locale}`)

  const orgs = await listarOrganizaciones()

  return <OrgListaPage orgs={orgs} nombre={admin.nombre} />
}
