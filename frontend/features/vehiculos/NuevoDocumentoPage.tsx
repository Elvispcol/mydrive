import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { obtenerVehiculo } from '@/lib/services/vehiculos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { DocumentoVehiculoForm } from './components/DocumentoVehiculoForm'

interface Props {
  vehiculoId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function NuevoDocumentoPage({ vehiculoId, locale, rol, nombre, basePath }: Props) {
  const vehiculo = await obtenerVehiculo(vehiculoId)
  if (!vehiculo) notFound()

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
            title={`Nuevo documento · ${vehiculo.placa}`}
            subtitle="Registra SOAT, tecno-mecánica, pólizas u otro documento con fecha de vencimiento"
            actions={<LogoutButton />}
          />

          <DocumentoVehiculoForm
            vehiculoId={vehiculoId}
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
