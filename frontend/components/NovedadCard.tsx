import type { Novedad } from '@/lib/supabase/types'

const PRIORIDAD_ESTILOS: Record<string, string> = {
  critica: 'border-l-red-600',
  alta:    'border-l-orange-500',
  media:   'border-l-yellow-400',
  baja:    'border-l-gray-300',
}

const ESTADO_BADGE: Record<string, string> = {
  abierta:    'bg-red-100 text-red-700',
  en_proceso: 'bg-yellow-100 text-yellow-700',
  cerrada:    'bg-green-100 text-green-700',
}

const ORIGEN_BADGE: Record<string, string> = {
  preoperacional: 'bg-blue-100 text-blue-700',
  evento:         'bg-orange-100 text-orange-700',
  manual:         'bg-gray-100 text-gray-600',
  documento:      'bg-purple-100 text-purple-700',
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
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${PRIORIDAD_ESTILOS[novedad.prioridad]} px-4 py-3`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-900 leading-snug">{novedad.titulo}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ESTADO_BADGE[novedad.estado]}`}>
          {novedad.estado.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORIGEN_BADGE[novedad.origen_tipo]}`}>
          {novedad.origen_tipo}
        </span>
        <span className="text-xs text-gray-400">{tiempoRelativo(novedad.creado_en)}</span>
      </div>

      {novedad.descripcion && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{novedad.descripcion}</p>
      )}
    </div>
  )
}
