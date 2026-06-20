import Link from 'next/link'
import { Badge } from '@/shared/components/ui/Badge'
import type { ConductorConVehiculo } from '@/lib/services/conductores'

const TIPO_ASIGNACION_LABEL: Record<string, string> = {
  beneficio:          'Beneficio',
  herramienta_trabajo:'Herramienta',
  seguridad:          'Seguridad',
  representacion:     'Representación',
  otro:               'Otro',
}

interface Props {
  conductor: ConductorConVehiculo
  href: string
}

export function ConductorRow({ conductor: c, href }: Props) {
  const dias = c.dias_para_vencer_licencia
  const licenciaVariant = dias === null ? 'muted' : dias < 0 ? 'danger' : dias <= 7 ? 'danger' : dias <= 30 ? 'warning' : 'success'
  const licenciaLabel = dias === null ? '—' : dias < 0 ? 'Vencida' : dias === 0 ? 'Hoy' : `${dias}d`

  return (
    <Link
      href={href}
      className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3
                 hover:bg-surface-raised transition-colors text-sm"
    >
      {/* Nombre + cédula */}
      <div>
        <p className="font-medium text-ink-900 truncate">{c.nombre}</p>
        <p className="text-xs text-ink-400">{c.documento ?? '—'} · {c.cargo ?? '—'}</p>
      </div>

      {/* Vehículo asignado */}
      <div>
        {c.asignacion_activa ? (
          <>
            <p className="font-mono text-xs font-semibold text-ink-900">
              {c.asignacion_activa.vehiculo.placa}
            </p>
            <p className="text-xs text-ink-400 truncate">
              {c.asignacion_activa.vehiculo.marca} {c.asignacion_activa.vehiculo.linea}
            </p>
          </>
        ) : (
          <p className="text-xs text-ink-300 italic">Sin vehículo</p>
        )}
      </div>

      {/* Tipo asignación */}
      <div>
        {c.asignacion_activa?.tipo_asignacion ? (
          <Badge variant="muted">
            {TIPO_ASIGNACION_LABEL[c.asignacion_activa.tipo_asignacion] ?? c.asignacion_activa.tipo_asignacion}
          </Badge>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </div>

      {/* Licencia */}
      <div>
        <p className="text-xs text-ink-400">Cat. {c.tipo_licencia ?? '—'}</p>
        <p className="text-xs text-ink-300">
          {c.licencia_vencimiento
            ? new Date(c.licencia_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'}
        </p>
      </div>

      {/* Regional */}
      <div>
        <p className="text-xs text-ink-500 truncate">{c.region?.nombre ?? '—'}</p>
        <p className="text-xs text-ink-300">{c.ciudad ?? '—'}</p>
      </div>

      {/* Badge vencimiento */}
      <Badge variant={licenciaVariant}>{licenciaLabel}</Badge>
    </Link>
  )
}
