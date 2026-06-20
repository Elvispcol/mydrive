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

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol, region_id')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || !['admin_apoyo', 'director'].includes(perfil.rol)) redirect('/')

  const { data: novedades } = await supabase
    .from('novedad')
    .select('*')
    .in('estado', ['abierta', 'en_proceso'])
    .order('creado_en', { ascending: false })
    .limit(20)

  const { data: tareas } = await supabase
    .from('tarea')
    .select('*, asignado: usuario!tarea_asignado_a_fkey(nombre)')
    .in('estado', ['abierta', 'en_proceso'])
    .order('vence_en', { ascending: true })
    .limit(10)

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
              <h1 className="text-xl font-bold text-ink-900 tracking-tight">Tablero</h1>
              <p className="text-sm text-ink-500 mt-0.5">Bienvenido, {perfil.nombre}</p>
            </div>
            <LogoutButton />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard label="Novedades abiertas"   value={novedadesAbiertas} variant="danger"  icon={<IconAlert />} />
            <KpiCard label="Tareas pendientes"     value={tareasAbiertas}    variant="warning" icon={<IconClipboard />} />
            <KpiCard label="Preoperacionales hoy"  value="—"                 variant="success" icon={<IconCheck />} />
            <KpiCard label="Vehículos activos"     value="—"                 variant="primary" icon={<IconTruck />} />
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Novedades recientes */}
            <section className="lg:col-span-3">
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Novedades recientes</h2>
              {novedades && novedades.length > 0 ? (
                <div className="space-y-2.5">
                  {(novedades as Novedad[]).map(n => (
                    <NovedadCard key={n.id} novedad={n} />
                  ))}
                </div>
              ) : (
                <EmptyState label="Sin novedades abiertas" />
              )}
            </section>

            {/* Tareas pendientes */}
            <section className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wider mb-4">Tareas pendientes</h2>
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                {tareas && tareas.length > 0 ? (
                  <div className="divide-y divide-border">
                    {(tareas as (Tarea & { asignado: { nombre: string } | null })[]).map(t => (
                      <div key={t.id} className="px-4 py-3 hover:bg-surface-raised transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-ink-900 leading-snug">{t.titulo}</p>
                          <PrioridadBadge prioridad={t.prioridad} />
                        </div>
                        {t.asignado && (
                          <p className="text-xs text-ink-500 mt-1">{t.asignado.nombre}</p>
                        )}
                        {t.vence_en && (
                          <p className="text-xs text-ink-300 mt-0.5">
                            Vence: {new Date(t.vence_en).toLocaleDateString('es-CO')}
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

type KpiVariant = 'danger' | 'warning' | 'success' | 'primary'

const KPI_STYLES: Record<KpiVariant, { wrap: string; icon: string; value: string }> = {
  danger:  { wrap: 'bg-surface border-border',      icon: 'bg-danger-pale text-danger-dark',   value: 'text-danger-dark' },
  warning: { wrap: 'bg-surface border-border',      icon: 'bg-warning-pale text-warning-dark', value: 'text-warning-dark' },
  success: { wrap: 'bg-surface border-border',      icon: 'bg-success-pale text-success-dark', value: 'text-ink-900' },
  primary: { wrap: 'bg-surface border-border',      icon: 'bg-primary-pale text-primary',      value: 'text-ink-900' },
}

function KpiCard({ label, value, variant, icon }: {
  label: string; value: string | number; variant: KpiVariant; icon: React.ReactNode
}) {
  const s = KPI_STYLES[variant]
  return (
    <div className={`rounded-xl border p-5 ${s.wrap}`}>
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${s.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${s.value}`}>{value}</p>
      <p className="text-xs text-ink-500 mt-1 leading-snug">{label}</p>
    </div>
  )
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const map: Record<string, string> = {
    critica: 'bg-danger-pale text-danger-dark',
    alta:    'bg-warning-pale text-warning-dark',
    media:   'bg-primary-pale text-primary',
    baja:    'bg-surface-raised text-ink-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${map[prioridad] ?? map.baja}`}>
      {prioridad}
    </span>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-8 text-center text-ink-300 text-sm">
      {label}
    </div>
  )
}

function IconAlert() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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

function IconTruck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
    </svg>
  )
}
