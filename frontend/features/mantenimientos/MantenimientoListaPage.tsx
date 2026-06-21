import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, EstadoMantenimiento } from '@/lib/supabase/types'
import { listarMantenimientos, type MantenimientoConVehiculo } from '@/lib/services/mantenimientos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const ESTADO_VARIANT: Record<EstadoMantenimiento, 'primary' | 'warning' | 'success' | 'muted'> = {
  programado:  'primary',
  en_proceso:  'warning',
  completado:  'success',
  cancelado:   'muted',
}

const ESTADO_LABEL: Record<EstadoMantenimiento, string> = {
  programado:  'Programado',
  en_proceso:  'En proceso',
  completado:  'Completado',
  cancelado:   'Cancelado',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function MantenimientoListaPage({ locale, rol, nombre, basePath }: Props) {
  const page = await listarMantenimientos({ limit: 50 })

  const pendientes = page.items.filter(m => m.estado === 'programado' || m.estado === 'en_proceso').length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <PageHeader
            title="Mantenimientos"
            subtitle={`${page.total} total · ${pendientes} pendiente${pendientes !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                >
                  <IconPlus /> Nuevo mantenimiento
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {page.items.length === 0 ? (
            <EmptyState label="Sin mantenimientos registrados" />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-2.5 bg-surface-raised border-b border-border">
                {['Descripción', 'Vehículo', 'Fecha', 'Estado', ''].map(h => (
                  <span key={h} className="text-xs font-semibold text-ink-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {page.items.map(m => (
                  <MantenimientoRow key={m.id} m={m} basePath={basePath} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MantenimientoRow({
  m, basePath, locale
}: {
  m: MantenimientoConVehiculo
  basePath: string
  locale: Locale
}) {
  const vehiculoLabel = m.vehiculo
    ? [m.vehiculo.placa, m.vehiculo.marca, m.vehiculo.linea].filter(Boolean).join(' · ')
    : '—'

  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-surface-raised transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 truncate">{m.descripcion}</p>
        {m.tipo && <p className="text-xs text-ink-400 capitalize">{m.tipo.replace(/_/g, ' ')}</p>}
      </div>
      <span className="text-sm text-ink-500 font-mono truncate">{vehiculoLabel}</span>
      <span className="text-sm text-ink-500">{formatDate(m.fecha, locale)}</span>
      <Badge variant={ESTADO_VARIANT[m.estado] ?? 'muted'}>{ESTADO_LABEL[m.estado] ?? m.estado}</Badge>
      <Link
        href={`${basePath}/${m.id}/editar`}
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
