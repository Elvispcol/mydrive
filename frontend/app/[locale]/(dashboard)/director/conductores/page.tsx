import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { listarConductores } from '@/lib/services/conductores'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { ConductorListaPage } from '@/features/conductores/ConductorListaPage'

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase.from('usuario').select('nombre, rol').eq('auth_id', user.id).single()
  if (!perfil || perfil.rol !== 'director') redirect(`/${locale}`)

  const conductores = await listarConductores()

  return (
    <div className="flex h-full">
      <Sidebar rol="director" nombre={perfil.nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <ConductorListaPage
            conductores={conductores}
            basePath={`/${locale}/director/conductores`}
            actions={<LogoutButton />}
          />
        </div>
      </main>
    </div>
  )
}
