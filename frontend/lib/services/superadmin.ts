import { createClient } from '@/lib/supabase/server'
import type { Organizacion } from '@/lib/supabase/types'

export interface OrgConStats extends Organizacion {
  total_usuarios: number
  total_vehiculos: number
}

export interface SuperadminPerfil {
  id: string
  nombre: string
  email: string
  activo: boolean
}

export async function getSuperadminPerfil(authId: string): Promise<SuperadminPerfil | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plataforma_admin')
    .select('id, nombre, email, activo')
    .eq('auth_id', authId)
    .eq('activo', true)
    .single()
  if (error || !data) return null
  return data as SuperadminPerfil
}

export async function listarOrganizaciones(): Promise<Organizacion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizacion')
    .select('*')
    .order('creado_en', { ascending: false })
  if (error) throw new Error(`superadmin.orgs: ${error.message}`)
  return (data ?? []) as Organizacion[]
}

export async function obtenerOrganizacion(id: string): Promise<Organizacion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizacion')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Organizacion
}

export async function toggleOrganizacion(id: string, activo: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('organizacion')
    .update({ activo })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function contarPorOrg(orgId: string): Promise<{ usuarios: number; vehiculos: number }> {
  const supabase = await createClient()
  const [usersRes, vehsRes] = await Promise.all([
    supabase
      .from('usuario')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('activo', true),
    supabase
      .from('vehiculo')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .is('eliminado_en', null),
  ])
  return { usuarios: usersRes.count ?? 0, vehiculos: vehsRes.count ?? 0 }
}
