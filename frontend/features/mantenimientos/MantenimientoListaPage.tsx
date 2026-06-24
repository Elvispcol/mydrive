import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, EstadoMantenimiento } from '@/lib/supabase/types'
import { listarMantenimientos, type MantenimientoConVehiculo } from '@/lib/services/mantenimientos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { StatusDot } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const ESTADO_VARIANT: Record<EstadoMantenimiento, 'primary' | 'warning' | 'success' | 'muted'> = {
  programado: 'primary',
  en_proceso: 'warning',
  completado: 'success',
  cancelado:  'muted',
}

const ESTADO_LABEL: Record<EstadoMantenimiento, string> = {
  programado: 'Programado',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado:  'Cancelado',
}

interface Props { locale: Locale; rol: Rol; nombre: string; basePath: string }

export async function MantenimientoListaPage({ locale, rol, nombre, basePath }: Props) {
  const page = await listarMantenimientos({ limit: 50 })
  const pendientes = page.items.filter(m => m.estado === 'programado' || m.estado === 'en_proceso').length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-6">
          <PageHeader
            title="Mantenimientos"
            badge="Flota"
            subtitle={`${page.total} total · ${pendientes} pendiente${pendientes !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
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
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="h-12 px-4 text-left text-[11px] font-medium text-ink-500">Descripción</th>
                    <th className="h-12 px-4 text-left text-[11px] font-medium text-ink-500 w-24">Tipo</th>
                    <th className="h-12 px-4 text-left text-[11px] font-medium text-ink-500 w-36">Vehículo</th>
                    <th className="h-12 px-4 text-left text-[11px] font-medium text-ink-500 w-28">Fecha</th>
                    <th className="h-12 px-4 text-left text-[11px] font-medium text-ink-500 w-28">Estado</th>
                    <th className="h-12 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {page.items.map(m => (
                    <MantenimientoRow key={m.id} m={m} basePath={basePath} locale={locale} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MantenimientoRow({ m, basePath, locale }: { m: MantenimientoConVehiculo; basePath: string; locale: Locale }) {
  const placa = m.vehiculo?.placa
  const vehiculoDesc = [m.vehiculo?.marca, m.vehiculo?.linea].filter(Boolean).join(' ')

  return (
    <tr className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group">
      <td className="h-9 px-4">
        <p className="text-xs font-medium text-ink-900 truncate leading-none">{m.descripcion}</p>
      </td>
      <td className="h-9 px-4 text-xs text-ink-500 capitalize">
        {m.tipo ? m.tipo.replace(/_/g, ' ') : <span className="text-ink-300">—</span>}
      </td>
      <td className="h-9 px-4">
        {placa ? (
          <div>
            <p className="font-mono text-xs font-semibold text-ink-900 leading-none">{placa}</p>
            {vehiculoDesc && <p className="text-[10px] text-ink-300 mt-0.5 leading-none">{vehiculoDesc}</p>}
          </div>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </td>
      <td className="h-9 px-4 text-xs text-ink-500">{formatDate(m.fecha, locale)}</td>
      <td className="h-9 px-4">
        <StatusDot variant={ESTADO_VARIANT[m.estado] ?? 'muted'}>{ESTADO_LABEL[m.estado] ?? m.estado}</StatusDot>
      </td>
      <td className="h-9 px-4">
        <Link
          href={`${basePath}/${m.id}/editar`}
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
