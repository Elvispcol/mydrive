import Link from 'next/link'
import { Badge } from '@/shared/components/ui/Badge'
import type { ConductorConVehiculo } from '@/lib/services/conductores'

const TIPO_ASIGNACION_LABEL: Record<string, string> = {
  beneficio:           'Beneficio',
  herramienta_trabajo: 'Herramienta',
  seguridad:           'Seguridad',
  representacion:      'Representación',
  otro:                'Otro',
}

interface Props {
  conductor: ConductorConVehiculo
  href: string
}

export function ConductorRow({ conductor: c, href }: Props) {
  const dias = c.dias_para_vencer_licencia
  const licenciaVariant = dias === null ? 'muted' : dias < 0 ? 'danger' : dias <= 7 ? 'danger' : dias <= 30 ? 'warning' : 'success'
  const licenciaLabel  = dias === null ? '—' : dias < 0 ? 'Vencida' : dias === 0 ? 'Hoy' : `${dias}d`

  return (
    <tr className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group">
      {/* Conductor */}
      <td className="h-9 px-4">
        <Link href={href} className="block">
          <p className="text-xs font-semibold text-ink-900 group-hover:text-primary transition-colors truncate leading-none">
            {c.nombre}
          </p>
          <p className="text-[10px] text-ink-300 mt-0.5 leading-none">{c.documento ?? '—'}</p>
        </Link>
      </td>

      {/* Vehículo */}
      <td className="h-9 px-4">
        {c.asignacion_activa ? (
          <div>
            <p className="font-mono text-xs font-semibold text-ink-900 leading-none">
              {c.asignacion_activa.vehiculo.placa}
            </p>
            <p className="text-[10px] text-ink-300 mt-0.5 leading-none truncate">
              {c.asignacion_activa.vehiculo.marca} {c.asignacion_activa.vehiculo.linea}
            </p>
          </div>
        ) : (
          <span className="text-xs text-ink-300 italic">Sin asignar</span>
        )}
      </td>

      {/* Tipo asignación */}
      <td className="h-9 px-4">
        {c.asignacion_activa?.tipo_asignacion ? (
          <Badge variant="muted">
            {TIPO_ASIGNACION_LABEL[c.asignacion_activa.tipo_asignacion] ?? c.asignacion_activa.tipo_asignacion}
          </Badge>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </td>

      {/* Licencia */}
      <td className="h-9 px-4">
        <p className="text-xs text-ink-500 leading-none">Cat. {c.tipo_licencia ?? '—'}</p>
        <p className="text-[10px] text-ink-300 mt-0.5 leading-none">
          {c.licencia_vencimiento
            ? new Date(c.licencia_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'}
        </p>
      </td>

      {/* Regional */}
      <td className="h-9 px-4">
        <p className="text-xs text-ink-500 truncate leading-none">{c.region?.nombre ?? '—'}</p>
        <p className="text-[10px] text-ink-300 mt-0.5 leading-none">{c.ciudad ?? '—'}</p>
      </td>

      {/* Estado licencia */}
      <td className="h-9 px-4">
        <Badge variant={licenciaVariant}>{licenciaLabel}</Badge>
      </td>

      {/* Acción */}
      <td className="h-9 px-2">
        <Link
          href={href}
          className="flex items-center justify-center w-6 h-6 rounded text-ink-300 hover:text-ink-700 hover:bg-surface-raised transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </td>
    </tr>
  )
}
