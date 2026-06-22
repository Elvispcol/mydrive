import { createClient } from '@/lib/supabase/server'
import type { Combustible, TipoCombustible } from '@/lib/supabase/types'

export type CombustibleConDetalle = Combustible & {
  vehiculo: { id: string; placa: string; marca: string | null } | null
  conductor: { id: string; nombre: string } | null
}

export interface CombustibleInput {
  vehiculo_id: string
  conductor_id: string | null
  region_id: string
  fecha: string
  km_odometro: number
  litros: number
  costo_litro: number | null
  costo_total: number | null
  tipo_combustible: TipoCombustible
  estacion: string | null
  numero_factura: string | null
  observaciones: string | null
}

function normalizar(row: unknown): CombustibleConDetalle {
  const r = row as Record<string, unknown>
  return {
    ...r,
    vehiculo:  Array.isArray(r.vehiculo)  ? r.vehiculo[0]  ?? null : r.vehiculo  ?? null,
    conductor: Array.isArray(r.conductor) ? r.conductor[0] ?? null : r.conductor ?? null,
  } as CombustibleConDetalle
}

export async function listarCombustible(limit = 50): Promise<CombustibleConDetalle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('combustible')
    .select('*, vehiculo:vehiculo_id(id, placa, marca), conductor:conductor_id(id, nombre)')
    .order('fecha', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`combustible.listar: ${error.message}`)
  return (data ?? []).map(normalizar)
}

export async function obtenerCombustible(id: string): Promise<CombustibleConDetalle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('combustible')
    .select('*, vehiculo:vehiculo_id(id, placa, marca), conductor:conductor_id(id, nombre)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return normalizar(data)
}

export async function crearCombustible(input: CombustibleInput): Promise<Combustible> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('combustible')
    .insert({
      vehiculo_id:    input.vehiculo_id,
      conductor_id:   input.conductor_id,
      region_id:      input.region_id,
      fecha:          input.fecha,
      km_odometro:    input.km_odometro,
      litros:         input.litros,
      costo_litro:    input.costo_litro,
      costo_total:    input.costo_total,
      tipo_combustible: input.tipo_combustible,
      estacion:       input.estacion,
      numero_factura: input.numero_factura,
      observaciones:  input.observaciones,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Combustible
}

export async function actualizarCombustible(
  id: string,
  input: Omit<CombustibleInput, 'vehiculo_id' | 'region_id'>,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('combustible')
    .update({
      conductor_id:     input.conductor_id,
      fecha:            input.fecha,
      km_odometro:      input.km_odometro,
      litros:           input.litros,
      costo_litro:      input.costo_litro,
      costo_total:      input.costo_total,
      tipo_combustible: input.tipo_combustible,
      estacion:         input.estacion,
      numero_factura:   input.numero_factura,
      observaciones:    input.observaciones,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarCombustible(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('combustible').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
