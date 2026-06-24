import type { VehiculoDetalle } from '@/lib/services/vehiculos'
import type { Locale } from '@/lib/i18n/config'
import { Badge, ESTADO_VEHICULO_VARIANT } from '@/shared/components/ui/Badge'

const ESTADO_LABEL: Record<string, string> = {
  activo:        'Activo',
  mantenimiento: 'En mantenimiento',
  inactivo:      'Inactivo',
  vendido:       'Vendido',
}

export function VehiculoInfoCard({
  vehiculo,
}: {
  vehiculo: VehiculoDetalle
  locale: Locale
}) {
  const makeModel = [vehiculo.marca, vehiculo.linea].filter(Boolean).join(' ')

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 font-mono">
              {vehiculo.placa}
            </h2>
            <Badge variant={ESTADO_VEHICULO_VARIANT[vehiculo.estado] ?? 'muted'}>
              {ESTADO_LABEL[vehiculo.estado] ?? vehiculo.estado}
            </Badge>
          </div>
          {makeModel && (
            <p className="text-sm text-ink-500">
              {makeModel}
              {vehiculo.modelo_anio && ` · ${vehiculo.modelo_anio}`}
              {vehiculo.tipo && ` · ${vehiculo.tipo}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 mt-5 pt-5 border-t border-border">
        <InfoField label="Región" value={vehiculo.region?.nombre ?? '—'} />
        <InfoField
          label="Conductor"
          value={vehiculo.conductor_actual?.nombre ?? 'Sin conductor asignado'}
          muted={!vehiculo.conductor_actual}
        />
        {vehiculo.tipo && <InfoField label="Tipo" value={vehiculo.tipo} />}
      </div>
    </div>
  )
}

function InfoField({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-ink-300 font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${muted ? 'text-ink-300 italic' : 'text-ink-900'}`}>
        {value}
      </p>
    </div>
  )
}
