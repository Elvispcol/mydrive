import { createClient } from '@/lib/supabase/server'

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
