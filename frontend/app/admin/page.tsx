import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Novedad, Tarea } from '@/lib/supabase/types'
import Sidebar from '@/components/Sidebar'
import NovedadCard from '@/components/NovedadCard'
import LogoutButton from '@/components/LogoutButton'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar rol
  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol, region_id')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || !['admin_apoyo', 'director'].includes(perfil.rol)) redirect('/')

  // Cargar novedades abiertas — RLS filtra automáticamente por región
  const { data: novedades } = await supabase
    .from('novedad')
    .select('*')
    .in('estado', ['abierta', 'en_proceso'])
    .order('creado_en', { ascending: false })
    .limit(20)

  // Cargar tareas pendientes
  const { data: tareas } = await supabase
    .from('tarea')
    .select('*, asignado: usuario!tarea_asignado_a_fkey(nombre)')
    .in('estado', ['abierta', 'en_proceso'])
    .order('vence_en', { ascending: true })
    .limit(10)

  // Contadores para el dashboard
  const novedadesAbiertas = novedades?.filter(n => n.estado === 'abierta').length ?? 0
  const tareasAbiertas = tareas?.length ?? 0

  return (
    <div className="flex h-full">
      <Sidebar rol="admin_apoyo" nombre={perfil.nombre} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tablero</h1>
              <p className="text-sm text-gray-500">Bienvenido, {perfil.nombre}</p>
            </div>
            <LogoutButton />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard label="Novedades abiertas" value={novedadesAbiertas} color="red" icon="⚠️" />
            <KpiCard label="Tareas pendientes" value={tareasAbiertas} color="orange" icon="📋" />
            <KpiCard label="Preoperacionales hoy" value="—" color="green" icon="✅" />
            <KpiCard label="Vehículos activos" value="—" color="blue" icon="🚛" />
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Novedades recientes */}
            <section className="lg:col-span-3">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Novedades recientes</h2>
              {novedades && novedades.length > 0 ? (
                <div className="space-y-3">
                  {(novedades as Novedad[]).map(n => (
                    <NovedadCard key={n.id} novedad={n} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                  Sin novedades abiertas
                </div>
              )}
            </section>

            {/* Tareas de hoy */}
            <section className="lg:col-span-2">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tareas pendientes</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {tareas && tareas.length > 0 ? (
                  (tareas as (Tarea & { asignado: { nombre: string } | null })[]).map(t => (
                    <div key={t.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 leading-snug">{t.titulo}</p>
                        <PrioridadBadge prioridad={t.prioridad} />
                      </div>
                      {t.asignado && (
                        <p className="text-xs text-gray-400 mt-1">{t.asignado.nombre}</p>
                      )}
                      {t.vence_en && (
                        <p className="text-xs text-gray-400">Vence: {new Date(t.vence_en).toLocaleDateString('es-CO')}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400 text-sm">Sin tareas pendientes</div>
                )}
                <div className="px-4 py-3">
                  <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
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

function KpiCard({ label, value, color, icon }: {
  label: string; value: string | number; color: string; icon: string
}) {
  const colors: Record<string, string> = {
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
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

function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const map: Record<string, string> = {
    critica: 'bg-red-100 text-red-700',
    alta: 'bg-orange-100 text-orange-700',
    media: 'bg-yellow-100 text-yellow-700',
    baja: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${map[prioridad] ?? map.baja}`}>
      {prioridad}
    </span>
  )
}
