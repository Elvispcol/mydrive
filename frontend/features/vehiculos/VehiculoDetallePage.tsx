import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { obtenerVehiculo, historialVehiculo } from '@/lib/services/vehiculos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { KpiCard } from '@/shared/components/ui/KpiCard'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { VehiculoInfoCard } from './components/VehiculoInfoCard'
import { PreoperacionalRow } from './components/PreoperacionalRow'
import { MantenimientoRow } from './components/MantenimientoRow'
import { NovedadCard } from '@/features/novedades/components/NovedadCard'
import { formatDate } from '@/shared/utils/formatters'

const TABS = ['preoperacionales', 'novedades', 'mantenimientos'] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  preoperacionales: 'Preoperacionales',
  novedades:        'Novedades',
  mantenimientos:   'Mantenimientos',
}

interface Props {
  vehiculoId: string
  locale: Locale
  tab: string
  backHref: string
  rol: Rol
  nombre: string
}

export async function VehiculoDetallePage({
  vehiculoId,
  locale,
  tab,
  backHref,
  rol,
  nombre,
}: Props) {
  const currentTab: Tab = TABS.includes(tab as Tab) ? (tab as Tab) : 'preoperacionales'

  const [vehiculo, historial] = await Promise.all([
    obtenerVehiculo(vehiculoId),
    historialVehiculo(vehiculoId),
  ])

  if (!vehiculo) notFound()

  // KPIs computados desde los datos ya cargados — sin queries extra
  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const preoperacionalesMes = historial.preoperacionales.filter(
    (p) => p.fecha >= startOfMonth,
  ).length
  const novedadesAbiertas = historial.novedades.filter((n) => n.estado !== 'cerrada').length
  const mantenimientosPendientes = historial.mantenimientos_preventivos.filter(
    (m) => m.estado === 'pendiente',
  ).length
  const ultimoPreop = historial.preoperacionales[0]

  const vehiculoSubtitle =
    [vehiculo.marca, vehiculo.linea, vehiculo.modelo_anio]
      .filter(Boolean)
      .join(' · ') || 'Sin información'

  const totalMantenimientos =
    historial.mantenimientos.length + historial.mantenimientos_preventivos.length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">

          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6"
          >
            <IconChevronLeft />
            Vehículos
          </Link>

          <PageHeader
            title={vehiculo.placa}
            subtitle={vehiculoSubtitle}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href={`${backHref}/${vehiculo.id}/editar`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-ink-700 border border-border rounded-lg hover:bg-surface-raised transition-colors"
                >
                  <IconEdit /> Editar
                </Link>
                <LogoutButton />
              </div>
            }
          />

          <VehiculoInfoCard vehiculo={vehiculo} locale={locale} />

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-8">
            <KpiCard
              label="Preop. este mes"
              value={preoperacionalesMes}
              variant="primary"
              icon={<IconCheck />}
            />
            <KpiCard
              label="Novedades abiertas"
              value={novedadesAbiertas}
              variant={novedadesAbiertas > 0 ? 'danger' : 'success'}
              icon={<IconAlert />}
            />
            <KpiCard
              label="Mant. pendientes"
              value={mantenimientosPendientes}
              variant={mantenimientosPendientes > 0 ? 'warning' : 'success'}
              icon={<IconWrench />}
            />
            <KpiCard
              label="Último preop."
              value={ultimoPreop ? formatDate(ultimoPreop.fecha, locale) : '—'}
              variant="primary"
              icon={<IconCalendar />}
            />
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 border-b border-border mb-6" aria-label="Secciones">
            {TABS.map((t) => (
              <Link
                key={t}
                href={`?tab=${t}`}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                  currentTab === t
                    ? 'border-primary text-primary bg-primary-pale/30'
                    : 'border-transparent text-ink-500 hover:text-ink-900 hover:border-ink-200'
                }`}
              >
                {TAB_LABELS[t]}
              </Link>
            ))}
          </nav>

          {/* Tab: Preoperacionales */}
          {currentTab === 'preoperacionales' && (
            <section>
              {historial.preoperacionales.length > 0 ? (
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {historial.preoperacionales.map((p) => (
                      <PreoperacionalRow key={p.id} preoperacional={p} locale={locale} />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState label="Sin preoperacionales registrados para este vehículo" />
              )}
            </section>
          )}

          {/* Tab: Novedades */}
          {currentTab === 'novedades' && (
            <section>
              {historial.novedades.length > 0 ? (
                <div className="space-y-2.5">
                  {historial.novedades.map((n) => (
                    <NovedadCard key={n.id} novedad={n} locale={locale} />
                  ))}
                </div>
              ) : (
                <EmptyState label="Sin novedades registradas para este vehículo" />
              )}
            </section>
          )}

          {/* Tab: Mantenimientos */}
          {currentTab === 'mantenimientos' && (
            <section>
              {totalMantenimientos > 0 ? (
                <div className="space-y-3">
                  {historial.mantenimientos_preventivos.map((m) => (
                    <MantenimientoRow
                      key={m.id}
                      tipo="preventivo"
                      mantenimiento={m}
                      locale={locale}
                    />
                  ))}
                  {historial.mantenimientos.map((m) => (
                    <MantenimientoRow
                      key={m.id}
                      tipo="correctivo"
                      mantenimiento={m}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState label="Sin mantenimientos registrados para este vehículo" />
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  )
}

function IconEdit() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}
function IconWrench() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
