import { createClient } from '@/lib/supabase/server'
import type { Vehiculo, EstadoVehiculo } from '@/lib/supabase/types'
import type { Page } from './novedades'

export type VehiculoConAsignado = Vehiculo & {
  asignacion: { usuario: { nombre: string } | null } | null
}

export interface ListarVehiculosOpts {
  estados?: EstadoVehiculo[]
  regionId?: string
  cursor?: string
  limit?: number
}

export async function listarVehiculos(opts: ListarVehiculosOpts = {}): Promise<Page<Vehiculo>> {
  const supabase = await createClient()
  const limit = opts.limit ?? 25

  let query = supabase
    .from('vehiculo')
    .select('*', { count: 'exact' })
    .order('placa', { ascending: true })
    .limit(limit + 1)

  if (opts.estados?.length) query = query.in('estado', opts.estados)
  if (opts.regionId) query = query.eq('region_id', opts.regionId)
  if (opts.cursor) query = query.gt('placa', opts.cursor)

  const { data, error, count } = await query
  if (error) throw new Error(`vehiculos.listar: ${error.message}`)

  const items = ((data ?? []) as Vehiculo[]).slice(0, limit)
  const hasMore = (data?.length ?? 0) > limit

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.placa ?? null) : null,
    total: count ?? 0,
  }
}

export async function contarVehiculos(estado?: EstadoVehiculo): Promise<number> {
  const supabase = await createClient()
  let query = supabase.from('vehiculo').select('*', { count: 'exact', head: true })
  if (estado) query = query.eq('estado', estado)
  const { count, error } = await query
  if (error) throw new Error(`vehiculos.contar: ${error.message}`)
  return count ?? 0
}
