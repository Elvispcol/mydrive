import type { Novedad } from '@/lib/supabase/types'
import { Badge, PRIORIDAD_VARIANT, ESTADO_NOVEDAD_VARIANT, ORIGEN_VARIANT } from '@/shared/components/ui/Badge'
import type { Locale } from '@/lib/i18n/config'
import { formatRelativeTime } from '@/shared/utils/formatters'

const PRIORIDAD_BORDER: Record<string, string> = {
  critica: 'border-l-danger',
  alta:    'border-l-warning',
  media:   'border-l-primary-light',
  baja:    'border-l-ink-100',
}

const ESTADO_LABEL: Record<string, string> = {
  abierta:    'abierta',
  en_proceso: 'en proceso',
  cerrada:    'cerrada',
}

export function NovedadCard({ novedad, locale = 'es' }: { novedad: Novedad; locale?: Locale }) {
  return (
    <div className={`bg-surface rounded-xl border border-border border-l-4 ${PRIORIDAD_BORDER[novedad.prioridad] ?? 'border-l-ink-100'} px-4 py-3 transition-shadow hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900 leading-snug">{novedad.titulo}</p>
        <Badge variant={ESTADO_NOVEDAD_VARIANT[novedad.estado]}>
          {ESTADO_LABEL[novedad.estado] ?? novedad.estado}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Badge variant={ORIGEN_VARIANT[novedad.origen_tipo]}>
          {novedad.origen_tipo}
        </Badge>
        <span className="text-xs text-ink-300">
          {formatRelativeTime(novedad.creado_en, locale)}
        </span>
      </div>

      {novedad.descripcion && (
        <p className="text-xs text-ink-500 mt-1.5 line-clamp-2">{novedad.descripcion}</p>
      )}
    </div>
  )
}
