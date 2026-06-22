import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, TipoCombustible } from '@/lib/supabase/types'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { obtenerCombustible } from '@/lib/services/combustible'
import { listarConductoresSimple } from '@/lib/services/conductores'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { CombustibleForm } from './CombustibleForm'

const TIPO_LABELS: Record<TipoCombustible, string> = {
  gasolina:    'Gasolina',
  diesel:      'Diésel',
  gas_natural: 'Gas natural',
  electrico:   'Eléctrico',
  hibrido:     'Híbrido',
}

interface Props {
  combustibleId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function EditarCombustiblePage({ combustibleId, locale, rol, nombre, basePath }: Props) {
  const [{ items: vehiculos }, conductores, combustible] = await Promise.all([
    listarVehiculos({ estados: ['activo', 'mantenimiento', 'inactivo'], limit: 200 }),
    listarConductoresSimple(),
    obtenerCombustible(combustibleId),
  ])

  if (!combustible) notFound()

  const placa = combustible.vehiculo?.placa ?? combustible.vehiculo_id.slice(0, 8)

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6">
            <IconBack /> Combustible
          </Link>
          <PageHeader
            title={`Editar carga · ${placa}`}
            subtitle={`${TIPO_LABELS[combustible.tipo_combustible]} · ${combustible.fecha}`}
            actions={<LogoutButton />}
          />
          <CombustibleForm
            vehiculos={vehiculos}
            conductores={conductores}
            combustible={combustible}
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
