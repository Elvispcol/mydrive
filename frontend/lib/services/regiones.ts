import { createClient } from '@/lib/supabase/server'
import type { Region } from '@/lib/supabase/types'

export async function listarRegiones(): Promise<Region[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('region')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) throw new Error(`regiones.listar: ${error.message}`)
  return (data ?? []) as Region[]
}

export async function obtenerRegion(id: string): Promise<Region | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('region').select('*').eq('id', id).single()
  if (error) return null
  return data as Region
}

export async function crearRegion(nombre: string): Promise<Region> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('region')
    .insert({ nombre })
    .select()
    .single()
  if (error) throw new Error(`regiones.crear: ${error.message}`)
  return data as Region
}

export async function actualizarRegion(id: string, nombre: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('region').update({ nombre }).eq('id', id)
  if (error) throw new Error(`regiones.actualizar: ${error.message}`)
}

export async function toggleActivoRegion(id: string, activo: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('region').update({ activo }).eq('id', id)
  if (error) throw new Error(`regiones.toggleActivo: ${error.message}`)
}

export async function listarTodasRegiones(): Promise<Region[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('region')
    .select('*')
    .order('nombre')
  if (error) throw new Error(`regiones.listarTodas: ${error.message}`)
  return (data ?? []) as Region[]
}
