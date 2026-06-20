import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listarNovedades } from '@/lib/services/novedades'
import { flotaStats, cumplimientoMantenimientos, preoperacionalesHoy } from '@/lib/services/charts'
import { conductoresConAlerta } from '@/lib/services/conductores'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { KpiCard } from '@/shared/components/ui/KpiCard'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { KpiSkeleton, CardSkeleton } from '@/shared/components/ui/Skeleton'
import { ProgressWidget } from '@/shared/components/ui/ProgressWidget'
import { NovedadCard } from '@/features/novedades/components/NovedadCard'
import { BarChartVertical } from '@/shared/components/charts/BarChartVertical'
import type { Locale } from '@/lib/i18n/config'

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
    flota,
    mantenimientos,
    preops,
    alertas,
  ] = await Promise.all([
    listarNovedades({ estados: ['abierta', 'en_proceso'], limit: 20 }),
    flotaStats(),
    cumplimientoMantenimientos(),
    preoperacionalesHoy(),
    conductoresConAlerta(30),
  ])

  const vehiculosBarData = [
    { name: 'Activos',       value: flota.total - flota.en_mantenimiento, color: '#C8E63A' },
    { name: 'En mant.',      value: flota.en_mantenimiento,               color: '#f97316' },
    { name: 'Con novedad',   value: flota.con_novedad,                    color: '#ef4444' },
    { name: 'Sin asignar',   value: flota.sin_asignar,                    color: '#94a3b8' },
  ]

  const hoy = new Date()
  const mesNombre = hoy.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  return (
    <div className="flex h-full">
      <Sidebar rol="admin_apoyo" nombre={perfil.nombre} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          <PageHeader
            title="Tablero operacional"
            subtitle={`Bienvenido, ${perfil.nombre} — ${hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`}
            actions={<LogoutButton />}
          />

          {/* ── KPIs de flota ── */}
          <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">{Array.from({length:5}).map((_,i)=><KpiSkeleton key={i}/>)}</div>}>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <KpiCard
                label="Total flota"
                value={flota.total}
                variant="primary"
                icon={<IconTruck />}
              />
              <KpiCard
                label="Asignados"
                value={flota.asignados}
                variant="success"
                icon={<IconUser />}
              />
              <KpiCard
                label="Sin asignar"
                value={flota.sin_asignar}
                variant={flota.sin_asignar > 0 ? 'warning' : 'success'}
                icon={<IconUserX />}
              />
              <KpiCard
                label="En mantenimiento"
                value={flota.en_mantenimiento}
                variant={flota.en_mantenimiento > 0 ? 'warning' : 'success'}
                icon={<IconWrench />}
              />
              <KpiCard
                label="Con novedad abierta"
                value={flota.con_novedad}
                variant={flota.con_novedad > 0 ? 'danger' : 'success'}
                icon={<IconAlert />}
              />
            </div>
          </Suspense>

          {/* ── Cumplimiento: Mantenimientos + Preoperacionales ── */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <ProgressWidget
              title={`Mantenimientos preventivos — ${mesNombre}`}
              realizado={mantenimientos.completados_mes}
              total={mantenimientos.programados_mes}
              pct={mantenimientos.pct_cumplimiento}
              subtitles={[
                { label: 'Vencidos',          value: mantenimientos.vencidos,         variant: mantenimientos.vencidos > 0 ? 'danger' : 'muted' },
                { label: 'Próximos 15 días',  value: mantenimientos.proximos_15_dias, variant: mantenimientos.proximos_15_dias > 0 ? 'warning' : 'muted' },
              ]}
            />
            <ProgressWidget
              title="Preoperacionales hoy"
              realizado={preops.realizados}
              total={preops.esperados}
              pct={preops.pct_cumplimiento}
              subtitles={[
                {
                  label: 'Conductores pendientes',
                  value: Math.max(0, preops.esperados - preops.realizados),
                  variant: preops.esperados - preops.realizados > 0 ? 'warning' : 'muted',
                },
              ]}
            />
          </div>

          {/* ── Gráfica flota + Alertas de conductores ── */}
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <BarChartVertical
              data={vehiculosBarData}
              title="Estado de la flota"
            />

            {/* Conductores con alerta de licencia */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                  Alertas — Licencias por vencer
                </h3>
                <Link
                  href={`/${locale}/admin/conductores`}
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  Ver todos
                </Link>
              </div>

              {alertas.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-ink-300">Sin alertas activas</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {alertas.slice(0, 6).map(c => {
                    const dias = c.dias_para_vencer_licencia ?? 0
                    const variant = dias < 0 ? 'danger' : dias <= 7 ? 'danger' : 'warning'
                    const label = dias < 0 ? 'Vencida' : dias === 0 ? 'Vence hoy' : `${dias}d`
                    return (
                      <Link
                        key={c.id}
                        href={`/${locale}/admin/conductores/${c.id}`}
                        className="flex items-center justify-between py-2.5 hover:bg-surface-raised px-1 rounded transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink-900">{c.nombre}</p>
                          <p className="text-xs text-ink-400">
                            {c.asignacion_activa?.vehiculo?.placa ?? 'Sin vehículo'} · Lic. {c.tipo_licencia ?? '—'}
                          </p>
                        </div>
                        <Badge variant={variant}>{label}</Badge>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Novedades recientes ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider">
                Novedades abiertas
                {novedadesPage.total > 20 && (
                  <span className="ml-2 text-ink-300 normal-case font-normal">
                    ({novedadesPage.total} en total)
                  </span>
                )}
              </h2>
              <Link
                href={`/${locale}/admin/novedades`}
                className="text-xs text-primary hover:text-primary-hover font-medium"
              >
                Ver todas
              </Link>
            </div>
            <Suspense fallback={<CardSkeleton rows={5} />}>
              {novedadesPage.items.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-2.5">
                  {novedadesPage.items.map(n => (
                    <NovedadCard key={n.id} novedad={n} locale={locale} />
                  ))}
                </div>
              ) : (
                <EmptyState label="Sin novedades abiertas" />
              )}
            </Suspense>
          </section>

        </div>
      </main>
    </div>
  )
}

function IconTruck() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" /></svg>
}
function IconUser() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function IconUserX() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6h11m5-5l-5 5m5 0l-5-5" /></svg>
}
function IconWrench() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function IconAlert() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
}
