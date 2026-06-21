import { createClient } from '@/lib/supabase/server'
import type { Asignacion, TipoAsignacion } from '@/lib/supabase/types'

export type AsignacionDetalle = Asignacion & {
  vehiculo: { placa: string; marca: string | null; linea: string | null } | null
  conductor: { nombre: string; email: string } | null
}

export async function listarAsignacionesActivas(): Promise<AsignacionDetalle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('asignacion')
    .select(`
      *,
      vehiculo:vehiculo_id(placa, marca, linea),
      conductor:usuario_id(nombre, email)
    `)
    .is('hasta', null)
    .order('desde', { ascending: false })
  if (error) throw new Error(`asignaciones.listar: ${error.message}`)
  return (data ?? []) as AsignacionDetalle[]
}

export async function crearAsignacion(
  vehiculoId: string,
  conductorId: string,
  tipoAsignacion: TipoAsignacion,
  desde: string
): Promise<Asignacion> {
  const supabase = await createClient()

  // Cierra asignación previa del mismo conductor si existe
  await supabase
    .from('asignacion')
    .update({ hasta: desde, motivo_fin: 'nueva_asignacion' })
    .eq('usuario_id', conductorId)
    .is('hasta', null)

  // Cierra asignación previa del mismo vehículo si existe
  await supabase
    .from('asignacion')
    .update({ hasta: desde, motivo_fin: 'reasignacion_vehiculo' })
    .eq('vehiculo_id', vehiculoId)
    .is('hasta', null)

  const { data, error } = await supabase
    .from('asignacion')
    .insert({
      vehiculo_id: vehiculoId,
      usuario_id: conductorId,
      tipo_asignacion: tipoAsignacion,
      desde,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Asignacion
}

export async function terminarAsignacion(id: string, motivo: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('asignacion')
    .update({ hasta: new Date().toISOString(), motivo_fin: motivo })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
