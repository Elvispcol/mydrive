import { createClient } from '@/lib/supabase/server'
import type { Usuario, Rol } from '@/lib/supabase/types'

export async function obtenerPerfil(authId: string): Promise<Usuario | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('auth_id', authId)
    .single()
  if (error) return null
  return data as Usuario
}

export async function listarPorRegion(regionId: string, rol?: Rol): Promise<Usuario[]> {
  const supabase = await createClient()
  let query = supabase
    .from('usuario')
    .select('*')
    .eq('region_id', regionId)
    .eq('activo', true)
  if (rol) query = query.eq('rol', rol)
  const { data, error } = await query
  if (error) throw new Error(`usuarios.listarPorRegion: ${error.message}`)
  return (data ?? []) as Usuario[]
}

export async function requierePerfil(authId: string, rolesPermitidos?: Rol[]): Promise<Usuario> {
  const perfil = await obtenerPerfil(authId)
  if (!perfil) throw new Error('Perfil no encontrado')
  if (rolesPermitidos && !rolesPermitidos.includes(perfil.rol)) {
    throw new Error(`Rol no permitido: ${perfil.rol}`)
  }
  return perfil
}
