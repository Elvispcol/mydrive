import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, TipoDocumentoVehiculo } from '@/lib/supabase/types'
import { obtenerVehiculo } from '@/lib/services/vehiculos'
import { obtenerDocumento } from '@/lib/services/documentos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { DocumentoVehiculoForm } from './components/DocumentoVehiculoForm'

const TIPO_LABELS: Record<TipoDocumentoVehiculo, string> = {
  soat:               'SOAT',
  tecnomecanica:      'Tecno-mecánica',
  poliza_rc:          'Póliza RC',
  poliza_todo_riesgo: 'Póliza Todo Riesgo',
  tarjeta_operacion:  'Tarjeta de Operación',
  otro:               'Otro',
}

interface Props {
  vehiculoId: string
  documentoId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function EditarDocumentoPage({
  vehiculoId,
  documentoId,
  locale,
  rol,
  nombre,
  basePath,
}: Props) {
  const [vehiculo, documento] = await Promise.all([
    obtenerVehiculo(vehiculoId),
    obtenerDocumento(documentoId),
  ])

  if (!vehiculo || !documento) notFound()

  const detailHref = `${basePath}/${vehiculoId}?tab=documentos`

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6"
          >
            <IconBack /> {vehiculo.placa} — Documentos
          </Link>

          <PageHeader
            title={`Editar · ${TIPO_LABELS[documento.tipo]}`}
            subtitle={`Vehículo ${vehiculo.placa}${documento.numero ? ` · N.° ${documento.numero}` : ''}`}
            actions={<LogoutButton />}
          />

          <DocumentoVehiculoForm
            vehiculoId={vehiculoId}
            documento={documento}
            backHref={detailHref}
            successHref={detailHref}
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
