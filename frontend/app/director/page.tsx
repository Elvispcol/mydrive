import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import LogoutButton from '@/components/LogoutButton'

export default async function DirectorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'director') redirect('/')

  const [
    { count: totalVehiculos },
    { count: novedadesAbiertas },
    { count: tareasAbiertas },
    { data: regiones },
    { data: novedadesCriticas },
  ] = await Promise.all([
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }),
    supabase.from('novedad').select('*', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('tarea').select('*', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('region').select('id, nombre').eq('activo', true),
    supabase.from('novedad').select('*').eq('prioridad', 'critica').eq('estado', 'abierta').limit(5),
  ])

  return (
    <div className="flex h-full">
      <Sidebar rol="director" nombre={perfil.nombre} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-primary bg-primary-pale px-2.5 py-1 rounded-full inline-block mb-3">
                Vista nacional · Director
              </span>
              <h1 className="text-xl font-bold text-ink-900 tracking-tight">Resumen nacional</h1>
              <p className="text-sm text-ink-500 mt-0.5">Bienvenida, {perfil.nombre}</p>
            </div>
            <LogoutButton />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            <KpiCard icon={<IconTruck />} label="Total vehículos"    value={totalVehiculos ?? 0}    variant="primary" />
            <KpiCard icon={<IconAlert />} label="Novedades abiertas" value={novedadesAbiertas ?? 0} variant="danger" />
            <KpiCard icon={<IconClip />}  label="Tareas abiertas"    value={tareasAbiertas ?? 0}    variant="warning" />
            <KpiCard icon={<IconMap />}   label="Regiones activas"   value={regiones?.length ?? 0}  variant="success" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Tabla de regiones */}
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
                        <td colSpan={2} className="px-4 py-6 text-center text-ink-300 text-sm">Sin regiones configuradas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Novedades críticas */}
            <section>
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Novedades críticas abiertas</h2>
              <div className="space-y-2.5">
                {novedadesCriticas && novedadesCriticas.length > 0 ? (
                  novedadesCriticas.map(n => (
                    <div key={n.id} className="bg-surface rounded-xl border-l-4 border-l-danger border border-border px-4 py-3 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-semibold text-ink-900">{n.titulo}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs bg-danger-pale text-danger-dark px-2 py-0.5 rounded-full font-medium">
                          {n.origen_tipo}
                        </span>
                        <span className="text-xs text-ink-300">
                          {new Date(n.creado_en).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-surface rounded-xl border border-border p-6 text-center text-ink-300 text-sm">
                    Sin novedades críticas abiertas
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

type KpiVariant = 'danger' | 'warning' | 'success' | 'primary'

const KPI_STYLES: Record<KpiVariant, { icon: string; value: string }> = {
  danger:  { icon: 'bg-danger-pale text-danger-dark',   value: 'text-danger-dark' },
  warning: { icon: 'bg-warning-pale text-warning-dark', value: 'text-warning-dark' },
  success: { icon: 'bg-success-pale text-success-dark', value: 'text-ink-900' },
  primary: { icon: 'bg-primary-pale text-primary',      value: 'text-ink-900' },
}

function KpiCard({ icon, label, value, variant }: {
  icon: React.ReactNode; label: string; value: number; variant: KpiVariant
}) {
  const s = KPI_STYLES[variant]
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${s.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${s.value}`}>{value}</p>
      <p className="text-xs text-ink-500 mt-1 leading-snug">{label}</p>
    </div>
  )
}

function IconTruck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
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

function IconClip() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}
