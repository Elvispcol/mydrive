import { createClient } from '@/lib/supabase/server'
import type { TipoAsignacion, TipoLicencia } from '@/lib/supabase/types'

export async function listarConductoresSimple(): Promise<{ id: string; nombre: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('usuario')
    .select('id, nombre')
    .eq('rol', 'conductor')
    .eq('activo', true)
    .order('nombre')
  return (data ?? []) as { id: string; nombre: string }[]
}

export interface ConductorConVehiculo {
  id: string
  nombre: string
  email: string
  documento: string | null
  celular: string | null
  ciudad: string | null
  cargo: string | null
  tipo_licencia: TipoLicencia | null
  licencia_expedicion: string | null
  licencia_vencimiento: string | null
  foto_url: string | null
  activo: boolean
  fecha_ingreso: string | null
  region: { id: string; nombre: string } | null
  asignacion_activa: {
    id: string
    tipo_asignacion: TipoAsignacion | null
    desde: string
    vehiculo: {
      id: string
      placa: string
      marca: string | null
      linea: string | null
      modelo_anio: number | null
      estado: string
    }
  } | null
  dias_para_vencer_licencia: number | null
}

export interface ConductorInput {
  nombre: string
  email: string
  documento: string | null
  celular: string | null
  ciudad: string | null
  cargo: string | null
  tipo_licencia: TipoLicencia | null
  licencia_expedicion: string | null
  licencia_vencimiento: string | null
  fecha_ingreso: string | null
  region_id: string | null
}

function diasParaVencer(fecha: string | null): number | null {
  if (!fecha) return null
  const diff = new Date(fecha).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export async function listarConductores(): Promise<ConductorConVehiculo[]> {
  const supabase = await createClient()

  const { data: usuarios } = await supabase
    .from('usuario')
    .select(`
      id, nombre, email, documento, celular, ciudad, cargo,
      tipo_licencia, licencia_expedicion, licencia_vencimiento,
      foto_url, activo, fecha_ingreso,
      region:region_id ( id, nombre )
    `)
    .eq('rol', 'conductor')
    .eq('activo', true)
    .order('nombre')

  if (!usuarios?.length) return []

  const conductorIds = usuarios.map(u => u.id)
  const { data: asignaciones } = await supabase
    .from('asignacion')
    .select(`
      id, usuario_id, tipo_asignacion, desde,
      vehiculo:vehiculo_id ( id, placa, marca, linea, modelo_anio, estado )
    `)
    .in('usuario_id', conductorIds)
    .is('hasta', null)

  type AsignRow = NonNullable<typeof asignaciones>[number]
  const asignMap = new Map<string, AsignRow>()
  for (const a of asignaciones ?? []) {
    asignMap.set(a.usuario_id, a)
  }

  return usuarios.map(u => ({
    ...u,
    region: Array.isArray(u.region) ? u.region[0] ?? null : u.region,
    asignacion_activa: asignMap.get(u.id) ?? null,
    dias_para_vencer_licencia: diasParaVencer(u.licencia_vencimiento),
  })) as ConductorConVehiculo[]
}

export async function obtenerConductor(id: string): Promise<ConductorConVehiculo | null> {
  const supabase = await createClient()

  const { data: u } = await supabase
    .from('usuario')
    .select(`
      id, nombre, email, documento, celular, ciudad, cargo,
      tipo_licencia, licencia_expedicion, licencia_vencimiento,
      foto_url, activo, fecha_ingreso,
      region:region_id ( id, nombre )
    `)
    .eq('id', id)
    .eq('rol', 'conductor')
    .single()

  if (!u) return null

  const { data: asignacion } = await supabase
    .from('asignacion')
    .select(`
      id, tipo_asignacion, desde,
      vehiculo:vehiculo_id ( id, placa, marca, linea, modelo_anio, estado )
    `)
    .eq('usuario_id', id)
    .is('hasta', null)
    .single()

  return {
    ...u,
    region: Array.isArray(u.region) ? u.region[0] ?? null : u.region,
    asignacion_activa: asignacion ?? null,
    dias_para_vencer_licencia: diasParaVencer(u.licencia_vencimiento),
  } as ConductorConVehiculo
}

export async function conductoresConAlerta(dias = 30): Promise<ConductorConVehiculo[]> {
  const todos = await listarConductores()
  return todos.filter(c => {
    if (c.dias_para_vencer_licencia === null) return false
    return c.dias_para_vencer_licencia <= dias
  }).sort((a, b) => (a.dias_para_vencer_licencia ?? 999) - (b.dias_para_vencer_licencia ?? 999))
}

export async function actualizarConductor(id: string, input: Partial<ConductorInput>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('usuario').update(input).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function retirarConductor(id: string, motivo: string, fecha: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('asignacion')
    .update({ hasta: new Date().toISOString(), motivo_fin: motivo })
    .eq('usuario_id', id)
    .is('hasta', null)

  const { error } = await supabase
    .from('usuario')
    .update({
      activo: false,
      fecha_retiro: fecha,
      motivo_retiro: motivo,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
