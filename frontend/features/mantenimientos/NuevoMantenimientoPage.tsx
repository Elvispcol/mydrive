import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { MantenimientoForm } from './MantenimientoForm'

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
  vehiculoId?: string
}

export async function NuevoMantenimientoPage({ locale, rol, nombre, basePath, vehiculoId }: Props) {
  const { items: vehiculos } = await listarVehiculos({ estados: ['activo', 'mantenimiento'], limit: 200 })

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6">
            <IconBack /> Mantenimientos
          </Link>
          <PageHeader title="Nuevo mantenimiento" subtitle="Registra un trabajo programado o correctivo" actions={<LogoutButton />} />
          <MantenimientoForm
            vehiculos={vehiculos}
            backHref={basePath}
            successHref={basePath}
            preseleccionVehiculoId={vehiculoId}
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
