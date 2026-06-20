import { createClient } from '@/lib/supabase/server'
import type {
  Vehiculo, EstadoVehiculo,
  Novedad, Mantenimiento, MantenimientoPreventivo, Preoperacional,
} from '@/lib/supabase/types'
import type { Page } from './novedades'

export type VehiculoConAsignado = Vehiculo & {
  asignacion: { usuario: { nombre: string } | null } | null
}

export type VehiculoDetalle = Vehiculo & {
  region: { nombre: string } | null
  conductor_actual: { nombre: string; email: string } | null
}

export type PreoperacionalConConductor = Preoperacional & {
  conductor: { nombre: string } | null
}

export interface HistorialVehiculo {
  preoperacionales: PreoperacionalConConductor[]
  novedades: Novedad[]
  mantenimientos: Mantenimiento[]
  mantenimientos_preventivos: MantenimientoPreventivo[]
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

export async function obtenerVehiculo(id: string): Promise<VehiculoDetalle | null> {
  const supabase = await createClient()

  const [{ data: veh, error }, { data: asig }] = await Promise.all([
    supabase
      .from('vehiculo')
      .select('*, region:region_id(nombre)')
      .eq('id', id)
      .single(),
    supabase
      .from('asignacion')
      .select('usuario:usuario_id(nombre, email)')
      .eq('vehiculo_id', id)
      .is('hasta', null)
      .limit(1)
      .maybeSingle(),
  ])

  if (error || !veh) return null

  return {
    ...(veh as Vehiculo),
    region: (veh as unknown as { region: { nombre: string } | null }).region ?? null,
    conductor_actual:
      (asig as unknown as { usuario: { nombre: string; email: string } | null } | null)
        ?.usuario ?? null,
  }
}

export async function historialVehiculo(vehiculoId: string): Promise<HistorialVehiculo> {
  const supabase = await createClient()

  const [preopsRes, novedadesRes, mantRes, mantPrevRes] = await Promise.all([
    supabase
      .from('preoperacional')
      .select('*, conductor:usuario_id(nombre)')
      .eq('vehiculo_id', vehiculoId)
      .order('fecha', { ascending: false })
      .limit(30),
    supabase
      .from('novedad')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .order('creado_en', { ascending: false })
      .limit(20),
    supabase
      .from('mantenimiento')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .order('fecha', { ascending: false })
      .limit(20),
    supabase
      .from('mantenimiento_preventivo')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .order('fecha_programada', { ascending: false })
      .limit(20),
  ])

  return {
    preoperacionales: (preopsRes.data ?? []) as PreoperacionalConConductor[],
    novedades: (novedadesRes.data ?? []) as Novedad[],
    mantenimientos: (mantRes.data ?? []) as Mantenimiento[],
    mantenimientos_preventivos: (mantPrevRes.data ?? []) as MantenimientoPreventivo[],
  }
}
