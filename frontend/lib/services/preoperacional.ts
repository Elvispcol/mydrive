import { createClient } from '@/lib/supabase/server'
import type { Preoperacional, ChecklistPlantilla, ChecklistItem } from '@/lib/supabase/types'

export type PreoperacionalConVehiculo = Preoperacional & {
  vehiculo: { placa: string; marca: string | null; linea: string | null } | null
}

export type PreoperacionalConDetalle = Preoperacional & {
  conductor: { nombre: string } | null
  vehiculo: { placa: string; marca: string | null; linea: string | null } | null
}

export type RespuestaConItem = {
  id: string
  aprobado: boolean
  nota: string | null
  item: { texto: string; critico: boolean; orden: number } | null
}

export type PreoperacionalCompleto = PreoperacionalConDetalle & {
  respuestas: RespuestaConItem[]
}

export type PlantillaConItems = ChecklistPlantilla & {
  checklist_item: ChecklistItem[]
}

export type AsignacionConVehiculo = {
  vehiculo_id: string
  vehiculo: {
    id: string
    placa: string
    marca: string | null
    linea: string | null
    modelo_anio: number | null
  } | null
}

export async function obtenerPlantillaActiva(orgId: string): Promise<PlantillaConItems | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('checklist_plantilla')
    .select('id, nombre, activa, creado_en, org_id, checklist_item(id, texto, orden, critico)')
    .eq('org_id', orgId)
    .eq('activa', true)
    .order('orden', { referencedTable: 'checklist_item', ascending: true })
    .single()
  if (error) return null
  return data as PlantillaConItems
}

export async function obtenerAsignacionVigente(usuarioId: string): Promise<AsignacionConVehiculo | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('asignacion')
    .select('vehiculo_id, vehiculo(id, placa, marca, linea, modelo_anio)')
    .eq('usuario_id', usuarioId)
    .is('hasta', null)
    .single()
  if (error) return null
  return data as unknown as AsignacionConVehiculo
}

export async function preoperacionalDeHoy(usuarioId: string): Promise<Preoperacional | null> {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const { data } = await supabase
    .from('preoperacional')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('fecha', hoy)
    .lt('fecha', manana)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as Preoperacional | null
}

export async function listarMisPreoperacionales(
  usuarioId: string,
  limit = 30,
): Promise<PreoperacionalConVehiculo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('preoperacional')
    .select('*, vehiculo(placa, marca, linea)')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`preoperacional.mis: ${error.message}`)
  return (data ?? []).map((row: unknown) => {
    const r = row as Record<string, unknown>
    return {
      ...r,
      vehiculo: Array.isArray(r.vehiculo) ? r.vehiculo[0] ?? null : r.vehiculo ?? null,
    } as PreoperacionalConVehiculo
  })
}

function normalizar<T>(row: Record<string, unknown>, keys: string[]): T {
  const result = { ...row }
  for (const k of keys) result[k] = Array.isArray(row[k]) ? row[k][0] ?? null : row[k] ?? null
  return result as T
}

export async function listarPreoperacionalesConDetalle(opts?: {
  fecha?: string
  limit?: number
}): Promise<PreoperacionalConDetalle[]> {
  const supabase = await createClient()
  const fecha = opts?.fecha ?? new Date().toISOString().split('T')[0]
  const manana = new Date(new Date(fecha + 'T12:00:00').getTime() + 86400000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('preoperacional')
    .select('*, conductor:usuario(nombre), vehiculo(placa, marca, linea)')
    .gte('fecha', fecha)
    .lt('fecha', manana)
    .order('fecha', { ascending: false })
    .limit(opts?.limit ?? 100)
  if (error) throw new Error(`preoperacional.listarDetalle: ${error.message}`)
  return (data ?? []).map(r => normalizar<PreoperacionalConDetalle>(r as Record<string, unknown>, ['conductor', 'vehiculo']))
}

export async function obtenerPreoperacionalCompleto(id: string): Promise<PreoperacionalCompleto | null> {
  const supabase = await createClient()
  const [{ data: preop }, { data: respuestas }] = await Promise.all([
    supabase
      .from('preoperacional')
      .select('*, conductor:usuario(nombre), vehiculo(placa, marca, linea)')
      .eq('id', id)
      .single(),
    supabase
      .from('preoperacional_respuesta')
      .select('id, aprobado, nota, item:checklist_item(texto, critico, orden)')
      .eq('preoperacional_id', id)
      .order('orden', { referencedTable: 'checklist_item', ascending: true }),
  ])
  if (!preop) return null
  const base = normalizar<PreoperacionalConDetalle>(preop as Record<string, unknown>, ['conductor', 'vehiculo'])
  const resp: RespuestaConItem[] = (respuestas ?? []).map(r =>
    normalizar<RespuestaConItem>(r as Record<string, unknown>, ['item'])
  )
  return { ...base, respuestas: resp }
}

export async function listarPreoperacionales(opts?: {
  vehiculoId?: string
  usuarioId?: string
  limit?: number
}): Promise<Preoperacional[]> {
  const supabase = await createClient()
  let query = supabase
    .from('preoperacional')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(opts?.limit ?? 50)

  if (opts?.vehiculoId) query = query.eq('vehiculo_id', opts.vehiculoId)
  if (opts?.usuarioId) query = query.eq('usuario_id', opts.usuarioId)

  const { data, error } = await query
  if (error) throw new Error(`preoperacional.listar: ${error.message}`)
  return (data ?? []) as Preoperacional[]
}
