import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { EditarDocumentoPage } from '@/features/vehiculos/EditarDocumentoPage'

export default async function DirectorEditarDocumentoPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string; docId: string }>
}) {
  const { locale, id, docId } = await params

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
    <EditarDocumentoPage
      vehiculoId={id}
      documentoId={docId}
      locale={locale}
      rol="director"
      nombre={perfil.nombre}
      basePath={`/${locale}/director/vehiculos`}
    />
  )
}
