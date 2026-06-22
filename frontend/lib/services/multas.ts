import { createClient } from '@/lib/supabase/server'
import type { MultaInfraccion, TipoInfraccion, EstadoMulta } from '@/lib/supabase/types'

export type MultaConDetalle = MultaInfraccion & {
  vehiculo:  { id: string; placa: string; marca: string | null } | null
  conductor: { id: string; nombre: string } | null
}

export interface MultaInput {
  vehiculo_id:          string
  conductor_id:         string | null
  region_id:            string
  fecha_infraccion:     string
  fecha_notificacion:   string | null
  tipo:                 TipoInfraccion
  descripcion:          string | null
  valor:                number | null
  descuento_pronto_pago: number | null
  fecha_limite_pago:    string | null
  estado:               EstadoMulta
  fecha_pago:           string | null
  observaciones:        string | null
}

function normalizar(row: unknown): MultaConDetalle {
  const r = row as Record<string, unknown>
  return {
    ...r,
    vehiculo:  Array.isArray(r.vehiculo)  ? r.vehiculo[0]  ?? null : r.vehiculo  ?? null,
    conductor: Array.isArray(r.conductor) ? r.conductor[0] ?? null : r.conductor ?? null,
  } as MultaConDetalle
}

export async function listarMultas(limit = 100): Promise<MultaConDetalle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('multa_infraccion')
    .select('*, vehiculo:vehiculo_id(id, placa, marca), conductor:conductor_id(id, nombre)')
    .order('fecha_infraccion', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`multas.listar: ${error.message}`)
  return (data ?? []).map(normalizar)
}

export async function obtenerMulta(id: string): Promise<MultaConDetalle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('multa_infraccion')
    .select('*, vehiculo:vehiculo_id(id, placa, marca), conductor:conductor_id(id, nombre)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return normalizar(data)
}

export async function crearMulta(input: MultaInput): Promise<MultaInfraccion> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('multa_infraccion')
    .insert({
      vehiculo_id:          input.vehiculo_id,
      conductor_id:         input.conductor_id,
      region_id:            input.region_id,
      fecha_infraccion:     input.fecha_infraccion,
      fecha_notificacion:   input.fecha_notificacion,
      tipo:                 input.tipo,
      descripcion:          input.descripcion,
      valor:                input.valor,
      descuento_pronto_pago: input.descuento_pronto_pago,
      fecha_limite_pago:    input.fecha_limite_pago,
      estado:               input.estado,
      fecha_pago:           input.fecha_pago,
      observaciones:        input.observaciones,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as MultaInfraccion
}

export async function actualizarMulta(
  id: string,
  input: Omit<MultaInput, 'vehiculo_id' | 'region_id'>,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('multa_infraccion')
    .update({
      conductor_id:         input.conductor_id,
      fecha_infraccion:     input.fecha_infraccion,
      fecha_notificacion:   input.fecha_notificacion,
      tipo:                 input.tipo,
      descripcion:          input.descripcion,
      valor:                input.valor,
      descuento_pronto_pago: input.descuento_pronto_pago,
      fecha_limite_pago:    input.fecha_limite_pago,
      estado:               input.estado,
      fecha_pago:           input.fecha_pago,
      observaciones:        input.observaciones,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarMulta(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('multa_infraccion').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
