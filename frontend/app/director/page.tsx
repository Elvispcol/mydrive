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

  // Métricas nacionales — RLS permite ver todo al director
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
              <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                Vista de director · Acceso nacional completo
              </p>
              <h1 className="text-2xl font-bold text-gray-900">Resumen nacional</h1>
              <p className="text-sm text-gray-500">Bienvenida, {perfil.nombre}</p>
            </div>
            <LogoutButton />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            <KpiCard icon="🚛" label="Total vehículos" value={totalVehiculos ?? 0} color="blue" />
            <KpiCard icon="⚠️" label="Novedades abiertas" value={novedadesAbiertas ?? 0} color="red" />
            <KpiCard icon="📋" label="Tareas abiertas" value={tareasAbiertas ?? 0} color="orange" />
            <KpiCard icon="🗺️" label="Regiones activas" value={regiones?.length ?? 0} color="green" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Tabla de regiones */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Detalle por región</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Región</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regiones?.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                        <td className="px-4 py-3 text-right text-gray-400">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Novedades críticas */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Novedades críticas abiertas</h2>
              <div className="space-y-3">
                {novedadesCriticas && novedadesCriticas.length > 0 ? (
                  novedadesCriticas.map(n => (
                    <div key={n.id} className="bg-white rounded-xl border-l-4 border-l-red-500 border border-gray-200 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{n.titulo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{n.origen_tipo}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(n.creado_en).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
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

function KpiCard({ icon, label, value, color }: {
  icon: string; label: string; value: number; color: string
}) {
  const colors: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
