import type { Mantenimiento, MantenimientoPreventivo } from '@/lib/supabase/types'
import type { Locale } from '@/lib/i18n/config'
import { Badge, ESTADO_MANTENIMIENTO_VARIANT } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const TIPO_LABEL: Record<string, string> = {
  aceite:           'Cambio de aceite',
  frenos:           'Frenos',
  llantas:          'Llantas',
  filtros:          'Filtros',
  revision_general: 'Revisión general',
  otro:             'Otro',
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente:  'Pendiente',
  completado: 'Completado',
  vencido:    'Vencido',
}

type Props =
  | { tipo: 'preventivo'; mantenimiento: MantenimientoPreventivo; locale: Locale }
  | { tipo: 'correctivo'; mantenimiento: Mantenimiento; locale: Locale }

export function MantenimientoRow(props: Props) {
  if (props.tipo === 'preventivo') {
    const m = props.mantenimiento
    return (
      <div className="bg-surface rounded-xl border border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-ink-300 uppercase tracking-wider">
                Preventivo
              </span>
            </div>
            <p className="text-sm font-semibold text-ink-900">
              {TIPO_LABEL[m.tipo] ?? m.tipo}
            </p>
            {m.descripcion && (
              <p className="text-xs text-ink-500 mt-1">{m.descripcion}</p>
            )}
            <div className="flex gap-4 mt-2 flex-wrap">
              <span className="text-xs text-ink-300">
                Programado: {formatDate(m.fecha_programada, props.locale)}
              </span>
              {m.fecha_realizada && (
                <span className="text-xs text-ink-500">
                  Realizado: {formatDate(m.fecha_realizada, props.locale)}
                </span>
              )}
              {m.kilometraje_alerta && (
                <span className="text-xs text-ink-300">
                  Alerta: {m.kilometraje_alerta.toLocaleString()} km
                </span>
              )}
            </div>
          </div>
          <Badge variant={ESTADO_MANTENIMIENTO_VARIANT[m.estado] ?? 'muted'}>
            {ESTADO_LABEL[m.estado] ?? m.estado}
          </Badge>
        </div>
        {m.observaciones && (
          <p className="text-xs text-ink-500 mt-3 pt-3 border-t border-border">
            {m.observaciones}
          </p>
        )}
      </div>
    )
  }

  const m = props.mantenimiento
  return (
    <div className="bg-surface rounded-xl border border-border px-5 py-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-ink-300 uppercase tracking-wider">
              Correctivo
            </span>
          </div>
          <p className="text-sm font-semibold text-ink-900">{m.tipo}</p>
          {m.descripcion && (
            <p className="text-xs text-ink-500 mt-1">{m.descripcion}</p>
          )}
          <span className="text-xs text-ink-300 mt-2 block">
            {formatDate(m.fecha, props.locale)}
          </span>
        </div>
        {m.costo != null && (
          <span className="text-sm font-semibold text-ink-900">
            ${m.costo.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
