import { createClient } from '@/lib/supabase/server'
import type { Usuario, Rol } from '@/lib/supabase/types'

export type UsuarioConRegion = Usuario & {
  region: { id: string; nombre: string } | null
}

export interface UsuarioInput {
  nombre: string
  email: string
  documento: string | null
  celular: string | null
  ciudad: string | null
  cargo: string | null
  rol: Rol
  region_id: string | null
  fecha_ingreso: string | null
}

export async function listarUsuariosSistema(): Promise<UsuarioConRegion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('*, region:region_id(id, nombre)')
    .in('rol', ['director', 'admin_apoyo'])
    .order('nombre')
  if (error) throw new Error(`usuarios.listar: ${error.message}`)

  return (data ?? []).map((u: unknown) => {
    const row = u as Record<string, unknown>
    return {
      ...row,
      region: Array.isArray(row.region) ? row.region[0] ?? null : row.region ?? null,
    } as UsuarioConRegion
  })
}

export async function listarTodosUsuarios(): Promise<UsuarioConRegion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('*, region:region_id(id, nombre)')
    .eq('activo', true)
    .order('nombre')
  if (error) throw new Error(`usuarios.listarTodos: ${error.message}`)

  return (data ?? []).map((u: unknown) => {
    const row = u as Record<string, unknown>
    return {
      ...row,
      region: Array.isArray(row.region) ? row.region[0] ?? null : row.region ?? null,
    } as UsuarioConRegion
  })
}

export async function obtenerUsuario(id: string): Promise<UsuarioConRegion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('*, region:region_id(id, nombre)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  const row = data as unknown as Record<string, unknown>
  return {
    ...row,
    region: Array.isArray(row.region) ? row.region[0] ?? null : row.region ?? null,
  } as UsuarioConRegion
}

export async function actualizarUsuario(id: string, input: Partial<UsuarioInput>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('usuario').update(input).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function desactivarUsuario(id: string, motivo: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('usuario')
    .update({
      activo: false,
      motivo_retiro: motivo,
      fecha_retiro: new Date().toISOString().split('T')[0],
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
