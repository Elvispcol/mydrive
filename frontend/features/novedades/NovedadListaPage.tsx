import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarNovedades } from '@/lib/services/novedades'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge, StatusDot } from '@/shared/components/ui/Badge'
import { SearchBar } from '@/shared/components/ui/SearchBar'
import { formatDate } from '@/shared/utils/formatters'

const PRIORIDAD_VARIANT: Record<string, 'danger' | 'warning' | 'primary' | 'muted'> = {
  critica: 'danger',
  alta:    'danger',
  media:   'warning',
  baja:    'muted',
}

const PRIORIDAD_LABEL: Record<string, string> = {
  critica: 'Crítica',
  alta:    'Alta',
  media:   'Media',
  baja:    'Baja',
}

const ESTADO_VARIANT: Record<string, 'danger' | 'warning' | 'success' | 'muted'> = {
  abierta:    'danger',
  en_proceso: 'warning',
  cerrada:    'success',
}

const ESTADO_LABEL: Record<string, string> = {
  abierta:    'Abierta',
  en_proceso: 'En proceso',
  cerrada:    'Cerrada',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
  q?: string
}

export async function NovedadListaPage({ locale, rol, nombre, basePath, q }: Props) {
  const page = await listarNovedades({ limit: 50 })

  const items = q
    ? page.items.filter(n =>
        n.titulo.toLowerCase().includes(q.toLowerCase()) ||
        (n.descripcion ?? '').toLowerCase().includes(q.toLowerCase())
      )
    : page.items

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-6">
          <PageHeader
            title="Novedades"
            subtitle={`${page.total} novedad${page.total !== 1 ? 'es' : ''}`}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href={`${basePath}/nueva`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <IconPlus /> Nueva novedad
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {page.items.length === 0 ? (
            <EmptyState label="Sin novedades registradas" />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-border">
                <SearchBar placeholder="Buscar novedades…" defaultValue={q} />
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="h-9 px-4 text-left w-28">Fecha</th>
                    <th className="h-9 px-4 text-left">Título</th>
                    <th className="h-9 px-4 text-left w-24">Prioridad</th>
                    <th className="h-9 px-4 text-left w-28">Estado</th>
                    <th className="h-9 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-ink-400">
                        Sin resultados para &ldquo;{q}&rdquo;
                      </td>
                    </tr>
                  ) : (
                    items.map(n => (
                      <tr key={n.id} className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group">
                        <td className="h-9 px-4 text-xs text-ink-500 whitespace-nowrap">
                          {formatDate(n.creado_en, locale)}
                        </td>
                        <td className="h-9 px-4">
                          <p className="text-xs font-medium text-ink-900 truncate">{n.titulo}</p>
                        </td>
                        <td className="h-9 px-4">
                          <Badge variant={PRIORIDAD_VARIANT[n.prioridad] ?? 'muted'}>
                            {PRIORIDAD_LABEL[n.prioridad] ?? n.prioridad}
                          </Badge>
                        </td>
                        <td className="h-9 px-4">
                          <StatusDot variant={ESTADO_VARIANT[n.estado] ?? 'muted'}>
                            {ESTADO_LABEL[n.estado] ?? n.estado}
                          </StatusDot>
                        </td>
                        <td className="h-9 px-2">
                          <Link
                            href={`${basePath}/${n.id}`}
                            className="flex items-center justify-center w-6 h-6 rounded text-ink-300 hover:text-ink-700 hover:bg-surface-raised transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <IconChevronRight />
                          </Link>
                        </td>
                      </tr>
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

function IconPlus() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
