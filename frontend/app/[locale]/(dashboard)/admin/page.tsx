import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { listarNovedades } from '@/lib/services/novedades'
import { listarTareas } from '@/lib/services/tareas'
import { novedadesPorEstado, tareasPorPrioridad, vehiculosPorEstado } from '@/lib/services/charts'
import { contarVehiculos } from '@/lib/services/vehiculos'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { KpiCard } from '@/shared/components/ui/KpiCard'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { KpiSkeleton, CardSkeleton } from '@/shared/components/ui/Skeleton'
import { NovedadCard } from '@/features/novedades/components/NovedadCard'
import { Badge, PRIORIDAD_VARIANT } from '@/shared/components/ui/Badge'
import { DonutChart } from '@/shared/components/charts/DonutChart'
import { BarChartVertical } from '@/shared/components/charts/BarChartVertical'
import { formatDate } from '@/shared/utils/formatters'
import type { Locale } from '@/lib/i18n/config'
import type { Tarea } from '@/lib/supabase/types'

export default async function AdminPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol, region_id')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || !['admin_apoyo', 'director'].includes(perfil.rol)) {
    redirect(`/${locale}`)
  }

  const [
    novedadesPage,
    tareasPage,
    novedadesEstados,
    tareasPrioridades,
    vehiculosEstados,
    vehiculosActivos,
  ] = await Promise.all([
    listarNovedades({ estados: ['abierta', 'en_proceso'], limit: 25 }),
    listarTareas({ estados: ['abierta', 'en_proceso'], limit: 10 }),
    novedadesPorEstado(),
    tareasPorPrioridad(),
    vehiculosPorEstado(),
    contarVehiculos('activo'),
  ])

  const novedadesAbiertas = novedadesEstados.abierta

  const donutData = [
    { name: 'Abiertas',    value: novedadesEstados.abierta,    color: '#ef4444' },
    { name: 'En proceso',  value: novedadesEstados.en_proceso, color: '#f97316' },
    { name: 'Cerradas',    value: novedadesEstados.cerrada,    color: '#C8E63A' },
  ]

  const barData = [
    { name: 'Crítica', value: tareasPrioridades.critica, color: '#ef4444' },
    { name: 'Alta',    value: tareasPrioridades.alta,    color: '#f97316' },
    { name: 'Media',   value: tareasPrioridades.media,   color: '#50AAFF' },
    { name: 'Baja',    value: tareasPrioridades.baja,    color: '#94a3b8' },
  ]

  return (
    <div className="flex h-full">
      <Sidebar rol="admin_apoyo" nombre={perfil.nombre} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          <PageHeader
            title="Tablero"
            subtitle={`Bienvenido, ${perfil.nombre}`}
            actions={<LogoutButton />}
          />

          {/* KPIs */}
          <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{Array.from({length:4}).map((_,i)=><KpiSkeleton key={i}/>)}</div>}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Novedades abiertas"  value={novedadesAbiertas}   variant="danger"  icon={<IconAlert />} />
              <KpiCard label="Tareas pendientes"    value={tareasPage.total}    variant="warning" icon={<IconClipboard />} />
              <KpiCard label="Vehículos activos"    value={vehiculosActivos}    variant="primary" icon={<IconTruck />} />
              <KpiCard
                label="En mantenimiento"
                value={vehiculosEstados.mantenimiento}
                variant={vehiculosEstados.mantenimiento > 0 ? 'warning' : 'success'}
                icon={<IconWrench />}
              />
            </div>
          </Suspense>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <DonutChart
              data={donutData}
              title="Novedades por estado"
            />
            <BarChartVertical
              data={barData}
              title="Tareas abiertas por prioridad"
            />
          </div>

          {/* Listas */}
          <div className="grid lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3">
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">
                Novedades recientes
                {novedadesPage.total > 25 && (
                  <span className="ml-2 text-ink-300 normal-case font-normal">
                    ({novedadesPage.total} en total)
                  </span>
                )}
              </h2>
              <Suspense fallback={<CardSkeleton rows={5} />}>
                {novedadesPage.items.length > 0 ? (
                  <div className="space-y-2.5">
                    {novedadesPage.items.map(n => (
                      <NovedadCard key={n.id} novedad={n} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <EmptyState label="Sin novedades abiertas" />
                )}
              </Suspense>
            </section>

            <section className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Tareas pendientes</h2>
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                {tareasPage.items.length > 0 ? (
                  <div className="divide-y divide-border">
                    {(tareasPage.items as (Tarea & { asignado: { nombre: string } | null })[]).map(t => (
                      <div key={t.id} className="px-4 py-3 hover:bg-surface-raised transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-ink-900 leading-snug">{t.titulo}</p>
                          <Badge variant={PRIORIDAD_VARIANT[t.prioridad]}>{t.prioridad}</Badge>
                        </div>
                        {t.asignado && (
                          <p className="text-xs text-ink-500 mt-1">{t.asignado.nombre}</p>
                        )}
                        {t.vence_en && (
                          <p className="text-xs text-ink-300 mt-0.5">
                            Vence: {formatDate(t.vence_en, locale)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-ink-300 text-sm">Sin tareas pendientes</div>
                )}
                <div className="px-4 py-3 border-t border-border bg-surface-raised">
                  <button className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
                    + Nueva tarea
                  </button>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  )
}

function IconAlert() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
}
function IconClipboard() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
}
function IconTruck() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" /></svg>
}
function IconWrench() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
