import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, EstadoTarea, Prioridad } from '@/lib/supabase/types'
import { listarTareas, type TareaConAsignado } from '@/lib/services/tareas'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const ESTADO_VARIANT: Record<EstadoTarea, 'primary' | 'warning' | 'success'> = {
  abierta:    'primary',
  en_proceso: 'warning',
  cerrada:    'success',
}

const ESTADO_LABEL: Record<EstadoTarea, string> = {
  abierta:    'Abierta',
  en_proceso: 'En proceso',
  cerrada:    'Cerrada',
}

const PRIORIDAD_VARIANT: Record<Prioridad, 'muted' | 'warning' | 'danger'> = {
  baja:    'muted',
  media:   'warning',
  alta:    'danger',
  critica: 'danger',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function TareaListaPage({ locale, rol, nombre, basePath }: Props) {
  const page = await listarTareas({ limit: 50 })
  const abiertas = page.items.filter(t => t.estado !== 'cerrada').length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <PageHeader
            title="Tareas"
            subtitle={`${page.total} total · ${abiertas} pendiente${abiertas !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                >
                  <IconPlus /> Nueva tarea
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {page.items.length === 0 ? (
            <EmptyState label="Sin tareas registradas" />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 bg-surface-raised border-b border-border">
                {['Título', 'Asignada a', 'Vence', 'Prioridad', 'Estado', ''].map(h => (
                  <span key={h} className="text-xs font-semibold text-ink-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {page.items.map(t => (
                  <TareaRow key={t.id} t={t} basePath={basePath} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function TareaRow({ t, basePath, locale }: { t: TareaConAsignado; basePath: string; locale: Locale }) {
  const hoy = new Date().toISOString().split('T')[0]
  const vencida = t.vence_en && t.vence_en < hoy && t.estado !== 'cerrada'

  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-surface-raised transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 truncate">{t.titulo}</p>
        {t.descripcion && (
          <p className="text-xs text-ink-400 truncate">{t.descripcion}</p>
        )}
      </div>
      <span className="text-sm text-ink-500 truncate">
        {t.asignado?.nombre ?? <span className="text-ink-300 italic">Sin asignar</span>}
      </span>
      <span className={`text-sm ${vencida ? 'text-danger-dark font-medium' : 'text-ink-500'}`}>
        {t.vence_en ? formatDate(t.vence_en, locale) : '—'}
      </span>
      <Badge variant={PRIORIDAD_VARIANT[t.prioridad]}>{t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1)}</Badge>
      <Badge variant={ESTADO_VARIANT[t.estado]}>{ESTADO_LABEL[t.estado]}</Badge>
      <Link
        href={`${basePath}/${t.id}/editar`}
        className="text-xs text-primary hover:text-primary-hover font-medium transition-colors shrink-0"
      >
        Editar
      </Link>
    </div>
  )
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
