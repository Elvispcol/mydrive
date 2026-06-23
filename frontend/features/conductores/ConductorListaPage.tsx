import Link from 'next/link'
import type { ReactNode } from 'react'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ConductorRow } from './components/ConductorRow'
import type { ConductorConVehiculo } from '@/lib/services/conductores'

interface Props {
  conductores: ConductorConVehiculo[]
  basePath: string
  actions?: ReactNode
}

export function ConductorListaPage({ conductores, basePath, actions }: Props) {
  const conAlerta = conductores.filter(c => (c.dias_para_vencer_licencia ?? 999) <= 30).length

  return (
    <>
      <PageHeader
        title="Conductores"
        badge="Flota"
        subtitle={`${conductores.length} conductor${conductores.length !== 1 ? 'es' : ''} activo${conductores.length !== 1 ? 's' : ''}${conAlerta > 0 ? ` · ${conAlerta} con alerta` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`${basePath}/nuevo`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              <IconPlus /> Nuevo conductor
            </Link>
            {actions}
          </div>
        }
      />

      {conductores.length === 0 ? (
        <EmptyState label="No hay conductores registrados" />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-raised border-b border-border">
                <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Conductor
                </th>
                <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-36">
                  Vehículo
                </th>
                <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">
                  Asignación
                </th>
                <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">
                  Licencia
                </th>
                <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">
                  Regional
                </th>
                <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-24">
                  Lic. estado
                </th>
                <th className="h-12 w-10" />
              </tr>
            </thead>
            <tbody>
              {conductores.map(c => (
                <ConductorRow key={c.id} conductor={c} href={`${basePath}/${c.id}`} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function IconPlus() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
