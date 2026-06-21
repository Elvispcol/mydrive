import { createClient } from '@/lib/supabase/server'
import type { Mantenimiento, EstadoMantenimiento } from '@/lib/supabase/types'
import type { Page } from './novedades'

export type MantenimientoConVehiculo = Mantenimiento & {
  vehiculo: { placa: string; marca: string | null; linea: string | null } | null
}

export interface ListarMantenimientosOpts {
  vehiculoId?: string
  estados?: EstadoMantenimiento[]
  cursor?: string
  limit?: number
}

export interface MantenimientoInput {
  vehiculo_id: string
  tipo: string
  descripcion: string
  costo: number | null
  fecha: string
  estado: EstadoMantenimiento
  km_en_servicio: number | null
}

export async function listarMantenimientos(
  opts: ListarMantenimientosOpts = {}
): Promise<Page<MantenimientoConVehiculo>> {
  const supabase = await createClient()
  const limit = opts.limit ?? 25

  let query = supabase
    .from('mantenimiento')
    .select('*, vehiculo:vehiculo_id(placa, marca, linea)', { count: 'exact' })
    .is('eliminado_en', null)
    .order('fecha', { ascending: false })
    .limit(limit + 1)

  if (opts.vehiculoId) query = query.eq('vehiculo_id', opts.vehiculoId)
  if (opts.estados?.length) query = query.in('estado', opts.estados)
  if (opts.cursor) query = query.lt('fecha', opts.cursor)

  const { data, error, count } = await query
  if (error) throw new Error(`mantenimientos.listar: ${error.message}`)

  const items = (data ?? []).slice(0, limit) as MantenimientoConVehiculo[]
  const hasMore = (data?.length ?? 0) > limit

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.fecha ?? null) : null,
    total: count ?? 0,
  }
}

export async function obtenerMantenimiento(id: string): Promise<MantenimientoConVehiculo | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mantenimiento')
    .select('*, vehiculo:vehiculo_id(placa, marca, linea)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as MantenimientoConVehiculo
}

export async function crearMantenimiento(input: MantenimientoInput): Promise<Mantenimiento> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mantenimiento')
    .insert({
      vehiculo_id: input.vehiculo_id,
      tipo: input.tipo,
      descripcion: input.descripcion.trim(),
      costo: input.costo ?? null,
      fecha: input.fecha,
      estado: input.estado,
      km_en_servicio: input.km_en_servicio ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Mantenimiento
}

export async function actualizarMantenimiento(
  id: string,
  input: Partial<MantenimientoInput>
): Promise<void> {
  const supabase = await createClient()
  const payload: Record<string, unknown> = { ...input }

  if (input.estado === 'completado') {
    payload.completado_en = new Date().toISOString().split('T')[0]
  }

  const { error } = await supabase.from('mantenimiento').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function contarMantenimientosPorEstado(estado: EstadoMantenimiento): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('mantenimiento')
    .select('*', { count: 'exact', head: true })
    .eq('estado', estado)
    .is('eliminado_en', null)
  if (error) throw new Error(`mantenimientos.contar: ${error.message}`)
  return count ?? 0
}
