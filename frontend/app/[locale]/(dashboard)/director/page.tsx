import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { listarNovedades } from '@/lib/services/novedades'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { KpiCard } from '@/shared/components/ui/KpiCard'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { KpiSkeleton } from '@/shared/components/ui/Skeleton'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'
import type { Locale } from '@/lib/i18n/config'

export default async function DirectorPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'director') redirect(`/${locale}`)

  const [
    { count: totalVehiculos },
    { count: novedadesAbiertas },
    { count: tareasAbiertas },
    { data: regiones },
    novedadesCriticasPage,
  ] = await Promise.all([
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }),
    supabase.from('novedad').select('*', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('tarea').select('*', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('region').select('id, nombre').eq('activo', true),
    listarNovedades({ estados: ['abierta'], prioridad: 'critica', limit: 10 }),
  ])

  return (
    <div className="flex h-full">
      <Sidebar rol="director" nombre={perfil.nombre} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          <PageHeader
            title="Resumen nacional"
            subtitle={`Bienvenida, ${perfil.nombre}`}
            badge="Vista nacional · Director"
            actions={<LogoutButton />}
          />

          <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{Array.from({length:4}).map((_,i)=><KpiSkeleton key={i}/>)}</div>}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard icon={<IconTruck />} label="Total vehículos"    value={totalVehiculos ?? 0}    variant="primary" />
              <KpiCard icon={<IconAlert />} label="Novedades abiertas" value={novedadesAbiertas ?? 0} variant="danger" />
              <KpiCard icon={<IconClip />}  label="Tareas abiertas"    value={tareasAbiertas ?? 0}    variant="warning" />
              <KpiCard icon={<IconMap />}   label="Regiones activas"   value={regiones?.length ?? 0}  variant="success" />
            </div>
          </Suspense>

          <div className="grid lg:grid-cols-2 gap-6">
            <section>
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Detalle por región</h2>
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-canvas">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Región</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {regiones?.map(r => (
                      <tr key={r.id} className="hover:bg-primary-pale transition-colors group">
                        <td className="px-4 py-3 font-medium text-ink-900 group-hover:text-primary">{r.nombre}</td>
                        <td className="px-4 py-3 text-right text-ink-300">—</td>
                      </tr>
                    ))}
                    {(!regiones || regiones.length === 0) && (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-ink-300 text-sm">
                          Sin regiones configuradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Novedades críticas abiertas</h2>
              {novedadesCriticasPage.items.length > 0 ? (
                <div className="space-y-2.5">
                  {novedadesCriticasPage.items.map(n => (
                    <div key={n.id} className="bg-surface rounded-xl border-l-4 border-l-danger border border-border px-4 py-3 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-semibold text-ink-900">{n.titulo}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="danger">{n.origen_tipo}</Badge>
                        <span className="text-xs text-ink-300">
                          {formatDate(n.creado_en, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="Sin novedades críticas abiertas" />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function IconTruck() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" /></svg>
}
function IconAlert() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
}
function IconClip() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
}
function IconMap() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
}
