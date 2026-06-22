import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { listarConductoresSimple } from '@/lib/services/conductores'
import { obtenerMulta } from '@/lib/services/multas'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { MultaForm } from './MultaForm'

interface Props { multaId: string; locale: Locale; rol: Rol; nombre: string; basePath: string }

export async function EditarMultaPage({ multaId, locale, rol, nombre, basePath }: Props) {
  const [{ items: vehiculos }, conductores, multa] = await Promise.all([
    listarVehiculos({ estados: ['activo', 'mantenimiento', 'inactivo'], limit: 200 }),
    listarConductoresSimple(),
    obtenerMulta(multaId),
  ])
  if (!multa) notFound()

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6"><IconBack /> Multas</Link>
          <PageHeader
            title={`Editar infracción · ${multa.vehiculo?.placa ?? '—'}`}
            subtitle={`${multa.fecha_infraccion} · ${multa.tipo}`}
            actions={<LogoutButton />}
          />
          <MultaForm vehiculos={vehiculos} conductores={conductores} multa={multa} backHref={basePath} successHref={basePath} />
        </div>
      </main>
    </div>
  )
}

function IconBack() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg> }
