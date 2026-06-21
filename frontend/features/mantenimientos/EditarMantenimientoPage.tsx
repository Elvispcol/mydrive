import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { obtenerMantenimiento } from '@/lib/services/mantenimientos'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { MantenimientoForm } from './MantenimientoForm'

interface Props {
  mantenimientoId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function EditarMantenimientoPage({ mantenimientoId, locale, rol, nombre, basePath }: Props) {
  const [mantenimiento, { items: vehiculos }] = await Promise.all([
    obtenerMantenimiento(mantenimientoId),
    listarVehiculos({ limit: 200 }),
  ])

  if (!mantenimiento) notFound()

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6">
            <IconBack /> Mantenimientos
          </Link>
          <PageHeader
            title="Editar mantenimiento"
            subtitle={mantenimiento.vehiculo ? `${mantenimiento.vehiculo.placa} · ${mantenimiento.descripcion ?? ''}` : mantenimiento.descripcion ?? undefined}
            actions={<LogoutButton />}
          />
          <MantenimientoForm
            vehiculos={vehiculos}
            mantenimiento={mantenimiento}
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
