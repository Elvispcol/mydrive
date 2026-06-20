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
  mantenimiento: 'En mantenimiento',
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

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <PageHeader
            title="Vehículos"
            subtitle={`${page.total} vehículo${page.total !== 1 ? 's' : ''} registrado${page.total !== 1 ? 's' : ''}`}
            actions={<LogoutButton />}
          />

          {page.items.length > 0 ? (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {page.items.map((v) => {
                  const makeModel = [v.marca, v.linea].filter(Boolean).join(' ')
                  return (
                    <Link
                      key={v.id}
                      href={`${basePath}/${v.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-surface-raised transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-bold text-ink-900 font-mono group-hover:text-primary transition-colors">
                          {v.placa}
                        </span>
                        {makeModel && (
                          <span className="text-sm text-ink-500 hidden sm:block truncate">
                            {makeModel}
                            {v.modelo_anio ? ` · ${v.modelo_anio}` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={ESTADO_VEHICULO_VARIANT[v.estado] ?? 'muted'}>
                          {ESTADO_LABEL[v.estado] ?? v.estado}
                        </Badge>
                        <IconChevronRight />
                      </div>
                    </Link>
                  )
                })}
              </div>

              {page.nextCursor && (
                <div className="px-5 py-3 border-t border-border bg-surface-raised text-center">
                  <span className="text-xs text-ink-300">
                    Mostrando los primeros 50 · Usa filtros para ver más
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

function IconChevronRight() {
  return (
    <svg
      className="w-4 h-4 text-ink-300 group-hover:text-primary transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
