import { createClient } from '@/lib/supabase/server'

// ─── Métricas de flota ──────────────────────────────────────────────────────

export interface FlotaStats {
  total: number
  asignados: number
  sin_asignar: number
  en_mantenimiento: number
  con_novedad: number
}

export async function flotaStats(): Promise<FlotaStats> {
  const supabase = await createClient()
  const [total, asignados, enMant, conNovedad] = await Promise.all([
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }),
    supabase.from('asignacion').select('vehiculo_id', { count: 'exact', head: true }).is('hasta', null),
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }).eq('estado', 'mantenimiento'),
    supabase.from('novedad').select('vehiculo_id').eq('estado', 'abierta').not('vehiculo_id', 'is', null),
  ])
  const vehiculosConNovedad = new Set((conNovedad.data ?? []).map((n: { vehiculo_id: string }) => n.vehiculo_id)).size
  const t = total.count ?? 0
  const a = asignados.count ?? 0
  return {
    total: t,
    asignados: a,
    sin_asignar: t - a,
    en_mantenimiento: enMant.count ?? 0,
    con_novedad: vehiculosConNovedad,
  }
}

// ─── Cumplimiento de mantenimientos ─────────────────────────────────────────

export interface CumplimientoMantenimiento {
  programados_mes: number
  completados_mes: number
  vencidos: number
  proximos_15_dias: number
  pct_cumplimiento: number
}

export async function cumplimientoMantenimientos(): Promise<CumplimientoMantenimiento> {
  const supabase = await createClient()
  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const finMes    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  const en15      = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hoy       = now.toISOString().slice(0, 10)

  const [programados, completados, vencidos, proximos] = await Promise.all([
    supabase.from('mantenimiento_preventivo')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_programada', inicioMes)
      .lte('fecha_programada', finMes),
    supabase.from('mantenimiento_preventivo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'completado')
      .gte('fecha_realizada', inicioMes)
      .lte('fecha_realizada', finMes),
    supabase.from('mantenimiento_preventivo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'vencido'),
    supabase.from('mantenimiento_preventivo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .gte('fecha_programada', hoy)
      .lte('fecha_programada', en15),
  ])

  const prog = programados.count ?? 0
  const comp = completados.count ?? 0
  return {
    programados_mes:  prog,
    completados_mes:  comp,
    vencidos:         vencidos.count ?? 0,
    proximos_15_dias: proximos.count ?? 0,
    pct_cumplimiento: prog > 0 ? Math.round((comp / prog) * 100) : 0,
  }
}

// ─── Preoperacionales del día ────────────────────────────────────────────────

export interface PreoperacionalesHoy {
  esperados: number
  realizados: number
  pct_cumplimiento: number
}

export async function preoperacionalesHoy(): Promise<PreoperacionalesHoy> {
  const supabase = await createClient()
  const hoy = new Date().toISOString().slice(0, 10)

  const [esperados, realizados] = await Promise.all([
    supabase.from('asignacion').select('*', { count: 'exact', head: true }).is('hasta', null),
    supabase.from('preoperacional').select('*', { count: 'exact', head: true }).eq('fecha', hoy),
  ])

  const e = esperados.count ?? 0
  const r = realizados.count ?? 0
  return {
    esperados: e,
    realizados: r,
    pct_cumplimiento: e > 0 ? Math.round((r / e) * 100) : 0,
  }
}

export interface NovedadesPorEstado {
  abierta: number
  en_proceso: number
  cerrada: number
}

export async function novedadesPorEstado(): Promise<NovedadesPorEstado> {
  const supabase = await createClient()
  const [a, ep, c] = await Promise.all([
    supabase.from('novedad').select('*', { count: 'exact', head: true }).eq('estado', 'abierta'),
    supabase.from('novedad').select('*', { count: 'exact', head: true }).eq('estado', 'en_proceso'),
    supabase.from('novedad').select('*', { count: 'exact', head: true }).eq('estado', 'cerrada'),
  ])
  return { abierta: a.count ?? 0, en_proceso: ep.count ?? 0, cerrada: c.count ?? 0 }
}

export interface TareasPorPrioridad {
  critica: number
  alta: number
  media: number
  baja: number
}

export async function tareasPorPrioridad(): Promise<TareasPorPrioridad> {
  const supabase = await createClient()
  const [cr, al, me, ba] = await Promise.all([
    supabase.from('tarea').select('*', { count: 'exact', head: true }).eq('prioridad', 'critica').neq('estado', 'cerrada'),
    supabase.from('tarea').select('*', { count: 'exact', head: true }).eq('prioridad', 'alta').neq('estado', 'cerrada'),
    supabase.from('tarea').select('*', { count: 'exact', head: true }).eq('prioridad', 'media').neq('estado', 'cerrada'),
    supabase.from('tarea').select('*', { count: 'exact', head: true }).eq('prioridad', 'baja').neq('estado', 'cerrada'),
  ])
  return { critica: cr.count ?? 0, alta: al.count ?? 0, media: me.count ?? 0, baja: ba.count ?? 0 }
}

export interface VehiculosPorEstado {
  activo: number
  mantenimiento: number
  inactivo: number
  vendido: number
}

export async function vehiculosPorEstado(): Promise<VehiculosPorEstado> {
  const supabase = await createClient()
  const [ac, ma, in_, ve] = await Promise.all([
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }).eq('estado', 'mantenimiento'),
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }).eq('estado', 'inactivo'),
    supabase.from('vehiculo').select('*', { count: 'exact', head: true }).eq('estado', 'vendido'),
  ])
  return {
    activo:        ac.count ?? 0,
    mantenimiento: ma.count ?? 0,
    inactivo:      in_.count ?? 0,
    vendido:       ve.count ?? 0,
  }
}

export interface NovedadDiaria {
  fecha: string
  total: number
}

export async function novedadesUltimos7Dias(): Promise<NovedadDiaria[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('novedad')
    .select('creado_en')
    .gte('creado_en', since)

  // Inicializar los 7 días con 0
  const byDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    byDay[d.toISOString().slice(0, 10)] = 0
  }

  for (const n of data ?? []) {
    const key = (n.creado_en as string).slice(0, 10)
    if (key in byDay) byDay[key]++
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => ({
      fecha: fecha.slice(5).replace('-', '/'), // MM/DD
      total,
    }))
}
