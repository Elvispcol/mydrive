import type { Novedad } from '@/lib/supabase/types'

const PRIORIDAD_BORDER: Record<string, string> = {
  critica: 'border-l-danger',
  alta:    'border-l-warning',
  media:   'border-l-primary-light',
  baja:    'border-l-ink-100',
}

const ESTADO_BADGE: Record<string, string> = {
  abierta:    'bg-danger-pale text-danger-dark',
  en_proceso: 'bg-warning-pale text-warning-dark',
  cerrada:    'bg-success-pale text-success-dark',
}

const ORIGEN_BADGE: Record<string, string> = {
  preoperacional: 'bg-primary-pale text-primary',
  evento:         'bg-warning-pale text-warning-dark',
  manual:         'bg-surface-raised text-ink-500',
  documento:      'bg-primary-pale text-primary-hover',
}

const ESTADO_LABEL: Record<string, string> = {
  abierta:    'abierta',
  en_proceso: 'en proceso',
  cerrada:    'cerrada',
}

function tiempoRelativo(fecha: string) {
  const diff = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} días`
}

export default function NovedadCard({ novedad }: { novedad: Novedad }) {
  return (
    <div className={`bg-surface rounded-xl border border-border border-l-4 ${PRIORIDAD_BORDER[novedad.prioridad] ?? 'border-l-ink-100'} px-4 py-3 transition-shadow hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900 leading-snug">{novedad.titulo}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ESTADO_BADGE[novedad.estado] ?? ESTADO_BADGE.abierta}`}>
          {ESTADO_LABEL[novedad.estado] ?? novedad.estado}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORIGEN_BADGE[novedad.origen_tipo] ?? ORIGEN_BADGE.manual}`}>
          {novedad.origen_tipo}
        </span>
        <span className="text-xs text-ink-300">{tiempoRelativo(novedad.creado_en)}</span>
      </div>

      {novedad.descripcion && (
        <p className="text-xs text-ink-500 mt-1.5 line-clamp-2">{novedad.descripcion}</p>
      )}
    </div>
  )
}
