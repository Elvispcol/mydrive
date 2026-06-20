import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listarConductores } from '@/lib/services/conductores'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { ConductorListaPage } from '@/features/conductores/ConductorListaPage'

import type { Locale } from '@/lib/i18n/config'

export default async function AdminConductoresPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || !['admin_apoyo', 'director'].includes(perfil.rol)) {
    redirect(`/${locale}`)
  }

  const conductores = await listarConductores()

  return (
    <div className="flex h-full">
      <Sidebar rol="admin_apoyo" nombre={perfil.nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <ConductorListaPage
            conductores={conductores}
            basePath={`/${locale}/admin/conductores`}
            actions={<LogoutButton />}
          />
        </div>
      </main>
    </div>
  )
}
