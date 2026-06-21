import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, Novedad } from '@/lib/supabase/types'
import { listarNovedades } from '@/lib/services/novedades'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const PRIORIDAD_VARIANT: Record<string, 'danger' | 'warning' | 'success' | 'muted'> = {
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
}

export async function NovedadListaPage({ locale, rol, nombre, basePath }: Props) {
  const page = await listarNovedades({ limit: 50 })

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <PageHeader
            title="Novedades"
            subtitle={`${page.total} novedad${page.total !== 1 ? 'es' : ''} registrada${page.total !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href={`${basePath}/nueva`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
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
            <div className="space-y-2">
              {page.items.map(n => (
                <NovedadRow key={n.id} novedad={n} basePath={basePath} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function NovedadRow({ novedad, basePath, locale }: { novedad: Novedad; basePath: string; locale: Locale }) {
  return (
    <Link
      href={`${basePath}/${novedad.id}`}
      className="flex items-start justify-between gap-4 bg-surface rounded-xl border border-border px-5 py-4 hover:bg-surface-raised transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={PRIORIDAD_VARIANT[novedad.prioridad] ?? 'muted'}>
            {PRIORIDAD_LABEL[novedad.prioridad] ?? novedad.prioridad}
          </Badge>
          <span className="text-xs text-ink-300">{formatDate(novedad.creado_en, locale)}</span>
        </div>
        <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-primary transition-colors">
          {novedad.titulo}
        </p>
        {novedad.descripcion && (
          <p className="text-xs text-ink-400 mt-0.5 line-clamp-1">{novedad.descripcion}</p>
        )}
      </div>
      <div className="shrink-0">
        <Badge variant={ESTADO_VARIANT[novedad.estado] ?? 'muted'}>
          {ESTADO_LABEL[novedad.estado] ?? novedad.estado}
        </Badge>
      </div>
    </Link>
  )
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
