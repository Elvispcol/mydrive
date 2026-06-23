import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge, ESTADO_VEHICULO_VARIANT } from '@/shared/components/ui/Badge'

const ESTADO_LABEL: Record<string, string> = {
  activo:        'Activo',
  mantenimiento: 'Mantenimiento',
  inactivo:      'Inactivo',
  vendido:       'Vendido',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function VehiculoListaPage({ locale, rol, nombre, basePath }: Props) {
  const page = await listarVehiculos({ limit: 50 })

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />

      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-6">
          <PageHeader
            title="Vehículos"
            badge="Flota"
            subtitle={`${page.total} vehículo${page.total !== 1 ? 's' : ''} registrado${page.total !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <IconPlus /> Nuevo vehículo
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {page.items.length > 0 ? (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">
                      Placa
                    </th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                      Marca / Modelo
                    </th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-20">
                      Año
                    </th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-28">
                      Tipo
                    </th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-36">
                      Estado
                    </th>
                    <th className="h-12 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((v) => {
                    const makeModel = [v.marca, v.linea].filter(Boolean).join(' ')
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group"
                      >
                        <td className="h-9 px-4">
                          <Link
                            href={`${basePath}/${v.id}`}
                            className="font-mono font-semibold text-xs text-ink-900 group-hover:text-primary transition-colors"
                          >
                            {v.placa}
                          </Link>
                        </td>
                        <td className="h-9 px-4 text-xs text-ink-700">
                          {makeModel || <span className="text-ink-300">—</span>}
                        </td>
                        <td className="h-9 px-4 text-xs text-ink-500">
                          {v.modelo_anio ?? <span className="text-ink-300">—</span>}
                        </td>
                        <td className="h-9 px-4 text-xs text-ink-500 capitalize">
                          {v.tipo ?? <span className="text-ink-300">—</span>}
                        </td>
                        <td className="h-9 px-4">
                          <Badge variant={ESTADO_VEHICULO_VARIANT[v.estado] ?? 'muted'}>
                            {ESTADO_LABEL[v.estado] ?? v.estado}
                          </Badge>
                        </td>
                        <td className="h-9 px-2">
                          <Link
                            href={`${basePath}/${v.id}`}
                            className="flex items-center justify-center w-6 h-6 rounded text-ink-300 hover:text-ink-700 hover:bg-surface-raised transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <IconChevronRight />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {page.nextCursor && (
                <div className="px-4 py-2.5 border-t border-border bg-surface-raised text-center">
                  <span className="text-xs text-ink-300">
                    Mostrando 50 · Usa filtros para ver más
                  </span>
                </div>
              )}
            </div>
          ) : (
            <EmptyState label="Sin vehículos registrados en tu región" />
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
