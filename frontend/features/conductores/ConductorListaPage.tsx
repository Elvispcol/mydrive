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
        subtitle={`${conductores.length} conductor${conductores.length !== 1 ? 'es' : ''} activo${conductores.length !== 1 ? 's' : ''}${conAlerta > 0 ? ` · ${conAlerta} con alerta de licencia` : ''}`}
        actions={actions}
      />

      {conductores.length === 0 ? (
        <EmptyState label="No hay conductores registrados" />
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {/* Cabecera de columnas */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-surface-raised border-b border-border">
            {['Conductor', 'Vehículo asignado', 'Tipo asignación', 'Licencia', 'Regional', 'Estado lic.'].map(h => (
              <span key={h} className="text-xs font-semibold text-ink-400 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Filas */}
          <div className="divide-y divide-border">
            {conductores.map(c => (
              <ConductorRow
                key={c.id}
                conductor={c}
                href={`${basePath}/${c.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
