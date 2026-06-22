import Link from 'next/link'
import type { DocumentoVehiculo, TipoDocumentoVehiculo } from '@/lib/supabase/types'
import { estadoExpiracion } from '@/lib/services/documentos'

const TIPO_LABELS: Record<TipoDocumentoVehiculo, string> = {
  soat:               'SOAT',
  tecnomecanica:      'Tecno-mecánica',
  poliza_rc:          'Póliza RC',
  poliza_todo_riesgo: 'Póliza Todo Riesgo',
  tarjeta_operacion:  'Tarjeta de Operación',
  otro:               'Otro',
}

const ESTADO_STYLES = {
  vencido: 'bg-danger-pale text-danger-dark border-danger/30',
  proximo: 'bg-warning-pale text-warning-dark border-warning/30',
  vigente: 'bg-success-pale text-success-dark border-success/30',
} as const

const ESTADO_LABELS = {
  vencido: 'Vencido',
  proximo: 'Por vencer',
  vigente: 'Vigente',
} as const

interface Props {
  documento: DocumentoVehiculo
  editHref: string
}

export function DocumentoRow({ documento, editHref }: Props) {
  const estado = estadoExpiracion(documento.vence_en)

  const diasRestantes = Math.floor(
    (new Date(documento.vence_en + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) /
      86_400_000,
  )

  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary-pale/50 flex items-center justify-center flex-shrink-0">
          <IconDoc />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900 truncate">
            {TIPO_LABELS[documento.tipo]}
          </p>
          {documento.numero && (
            <p className="text-xs text-ink-400 mt-0.5">
              N.° {documento.numero}
            </p>
          )}
          {documento.observaciones && (
            <p className="text-xs text-ink-400 mt-0.5 truncate max-w-xs">
              {documento.observaciones}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs text-ink-500 mb-1">Vence el</p>
          <p className="text-sm font-medium text-ink-800">
            {formatDate(documento.vence_en)}
          </p>
          {estado !== 'vigente' && (
            <p className="text-xs text-ink-400 mt-0.5">
              {diasRestantes < 0
                ? `Hace ${Math.abs(diasRestantes)} días`
                : `En ${diasRestantes} días`}
            </p>
          )}
        </div>

        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${ESTADO_STYLES[estado]}`}
        >
          {ESTADO_LABELS[estado]}
        </span>

        <Link
          href={editHref}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-ink-600 border border-border rounded-lg hover:bg-surface-raised transition-colors"
        >
          <IconEdit />
          Editar
        </Link>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function IconDoc() {
  return (
    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}
