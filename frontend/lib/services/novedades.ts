import { createClient } from '@/lib/supabase/server'
import type { Novedad, Prioridad, EstadoNovedad, OrigenNovedad } from '@/lib/supabase/types'

export interface Page<T> {
  items: T[]
  nextCursor: string | null
  total: number
}

export interface ListarNovedadesOpts {
  estados?: EstadoNovedad[]
  prioridad?: Prioridad
  cursor?: string
  limit?: number
}

export interface NovedadInput {
  titulo: string
  descripcion: string | null
  prioridad: Prioridad
  vehiculo_id: string | null
  origen_tipo?: OrigenNovedad
}

export async function listarNovedades(opts: ListarNovedadesOpts = {}): Promise<Page<Novedad>> {
  const supabase = await createClient()
  const limit = opts.limit ?? 25

  let query = supabase
    .from('novedad')
    .select('*', { count: 'exact' })
    .is('eliminado_en', null)
    .order('creado_en', { ascending: false })
    .limit(limit + 1)

  if (opts.estados?.length) query = query.in('estado', opts.estados)
  if (opts.prioridad) query = query.eq('prioridad', opts.prioridad)
  if (opts.cursor) query = query.lt('creado_en', opts.cursor)

  const { data, error, count } = await query
  if (error) throw new Error(`novedades.listar: ${error.message}`)

  const items = ((data ?? []) as Novedad[]).slice(0, limit)
  const hasMore = (data?.length ?? 0) > limit

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.creado_en ?? null) : null,
    total: count ?? 0,
  }
}

export async function obtenerNovedad(id: string): Promise<Novedad | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('novedad').select('*').eq('id', id).single()
  if (error) return null
  return data as Novedad
}

export async function crearNovedad(input: NovedadInput): Promise<Novedad> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('novedad')
    .insert({
      titulo: input.titulo.trim(),
      descripcion: input.descripcion || null,
      prioridad: input.prioridad,
      vehiculo_id: input.vehiculo_id || null,
      origen_tipo: input.origen_tipo ?? 'manual',
      estado: 'abierta',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Novedad
}

export async function actualizarNovedad(
  id: string,
  input: Partial<NovedadInput & { estado: EstadoNovedad; asignado_a: string | null }>
): Promise<void> {
  const supabase = await createClient()
  const payload: Record<string, unknown> = { ...input }
  if (input.titulo) payload.titulo = input.titulo.trim()

  if (input.estado === 'cerrada') {
    payload.resuelto_en = new Date().toISOString()
  }

  const { error } = await supabase.from('novedad').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function contarPorEstado(estado: EstadoNovedad): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('novedad')
    .select('*', { count: 'exact', head: true })
    .eq('estado', estado)
    .is('eliminado_en', null)
  if (error) throw new Error(`novedades.contar: ${error.message}`)
  return count ?? 0
}
