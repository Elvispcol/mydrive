import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, EstadoTarea, Prioridad } from '@/lib/supabase/types'
import { listarTareas, type TareaConAsignado } from '@/lib/services/tareas'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge, StatusDot } from '@/shared/components/ui/Badge'
import { SearchBar } from '@/shared/components/ui/SearchBar'
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

const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  baja:    'Baja',
  media:   'Media',
  alta:    'Alta',
  critica: 'Crítica',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
  q?: string
}

export async function TareaListaPage({ locale, rol, nombre, basePath, q }: Props) {
  const page = await listarTareas({ limit: 50 })
  const abiertas = page.items.filter(t => t.estado !== 'cerrada').length

  const items = q
    ? page.items.filter(t =>
        t.titulo.toLowerCase().includes(q.toLowerCase()) ||
        (t.descripcion ?? '').toLowerCase().includes(q.toLowerCase()) ||
        (t.asignado?.nombre ?? '').toLowerCase().includes(q.toLowerCase())
      )
    : page.items

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-6">
          <PageHeader
            title="Tareas"
            subtitle={`${page.total} total · ${abiertas} pendiente${abiertas !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
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
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-border">
                <SearchBar placeholder="Buscar tareas…" defaultValue={q} />
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="h-9 px-4 text-left">Título</th>
                    <th className="h-9 px-4 text-left w-36">Asignada a</th>
                    <th className="h-9 px-4 text-left w-24">Vence</th>
                    <th className="h-9 px-4 text-left w-20">Prioridad</th>
                    <th className="h-9 px-4 text-left w-24">Estado</th>
                    <th className="h-9 w-14" />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-ink-400">
                        Sin resultados para &ldquo;{q}&rdquo;
                      </td>
                    </tr>
                  ) : (
                    items.map(t => (
                      <TareaRow key={t.id} t={t} basePath={basePath} locale={locale} />
                    ))
                  )}
                </tbody>
              </table>
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
    <tr className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group">
      <td className="h-9 px-4">
        <p className="text-xs font-medium text-ink-900 truncate">{t.titulo}</p>
      </td>
      <td className="h-9 px-4 text-xs text-ink-500 truncate">
        {t.asignado?.nombre ?? <span className="text-ink-300 italic">Sin asignar</span>}
      </td>
      <td className={`h-9 px-4 text-xs whitespace-nowrap ${vencida ? 'text-danger-dark font-medium' : 'text-ink-500'}`}>
        {t.vence_en ? formatDate(t.vence_en, locale) : '—'}
      </td>
      <td className="h-9 px-4">
        <Badge variant={PRIORIDAD_VARIANT[t.prioridad]}>{PRIORIDAD_LABEL[t.prioridad]}</Badge>
      </td>
      <td className="h-9 px-4">
        <StatusDot variant={ESTADO_VARIANT[t.estado]}>{ESTADO_LABEL[t.estado]}</StatusDot>
      </td>
      <td className="h-9 px-2">
        <Link
          href={`${basePath}/${t.id}/editar`}
          className="text-[11px] text-primary hover:text-primary-hover font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Editar
        </Link>
      </td>
    </tr>
  )
}

function IconPlus() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
