import { createClient } from '@/lib/supabase/server'
import type { DocumentoVehiculo, TipoDocumentoVehiculo } from '@/lib/supabase/types'

export interface DocumentoInput {
  vehiculo_id: string
  tipo: TipoDocumentoVehiculo
  numero: string | null
  vence_en: string
  observaciones: string | null
}

export type EstadoExpiracion = 'vencido' | 'proximo' | 'vigente'

export function estadoExpiracion(venceEn: string): EstadoExpiracion {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const expiry = new Date(venceEn + 'T00:00:00')
  const diasRestantes = Math.floor((expiry.getTime() - hoy.getTime()) / 86_400_000)
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= 30) return 'proximo'
  return 'vigente'
}

export async function listarDocumentos(vehiculoId: string): Promise<DocumentoVehiculo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documento_vehiculo')
    .select('*')
    .eq('vehiculo_id', vehiculoId)
    .order('vence_en', { ascending: true })
  if (error) throw new Error(`documentos.listar: ${error.message}`)
  return (data ?? []) as DocumentoVehiculo[]
}

export async function obtenerDocumento(id: string): Promise<DocumentoVehiculo | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documento_vehiculo')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as DocumentoVehiculo
}

export async function crearDocumento(input: DocumentoInput): Promise<DocumentoVehiculo> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documento_vehiculo')
    .insert({
      vehiculo_id: input.vehiculo_id,
      tipo: input.tipo,
      numero: input.numero || null,
      vence_en: input.vence_en,
      observaciones: input.observaciones || null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as DocumentoVehiculo
}

export async function actualizarDocumento(
  id: string,
  input: Omit<DocumentoInput, 'vehiculo_id'>,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('documento_vehiculo')
    .update({
      tipo: input.tipo,
      numero: input.numero ?? null,
      vence_en: input.vence_en,
      observaciones: input.observaciones ?? null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function eliminarDocumento(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('documento_vehiculo')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
