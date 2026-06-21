import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { obtenerNovedad } from '@/lib/services/novedades'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { listarRegiones } from '@/lib/services/regiones'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import { NovedadForm } from './NovedadForm'
import { formatDate } from '@/shared/utils/formatters'

const PRIORIDAD_VARIANT: Record<string, 'danger' | 'warning' | 'success' | 'muted'> = {
  critica: 'danger', alta: 'danger', media: 'warning', baja: 'muted',
}
const PRIORIDAD_LABEL: Record<string, string> = {
  critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja',
}

interface Props {
  novedadId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function NovedadDetallePage({ novedadId, locale, rol, nombre, basePath }: Props) {
  const [novedad, { items: vehiculos }, regiones] = await Promise.all([
    obtenerNovedad(novedadId),
    listarVehiculos({ limit: 200 }),
    listarRegiones(),
  ])

  if (!novedad) notFound()

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6">
            <IconBack /> Novedades
          </Link>

          <PageHeader
            title={novedad.titulo}
            subtitle={`Registrada el ${formatDate(novedad.creado_en, locale)}`}
            badge={`${PRIORIDAD_LABEL[novedad.prioridad] ?? novedad.prioridad} · ${novedad.origen_tipo}`}
            actions={<LogoutButton />}
          />

          <div className="flex items-center gap-2 mb-6">
            <Badge variant={PRIORIDAD_VARIANT[novedad.prioridad] ?? 'muted'}>
              {PRIORIDAD_LABEL[novedad.prioridad] ?? novedad.prioridad}
            </Badge>
          </div>

          <NovedadForm
            vehiculos={vehiculos}
            regiones={regiones}
            novedad={novedad}
            backHref={basePath}
            successHref={basePath}
          />
        </div>
      </main>
    </div>
  )
}

function IconBack() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
