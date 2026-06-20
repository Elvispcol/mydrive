import { createClient } from '@/lib/supabase/server'
import type { Novedad, Prioridad, EstadoNovedad } from '@/lib/supabase/types'

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

export async function listarNovedades(opts: ListarNovedadesOpts = {}): Promise<Page<Novedad>> {
  const supabase = await createClient()
  const limit = opts.limit ?? 25

  let query = supabase
    .from('novedad')
    .select('*', { count: 'exact' })
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

export async function contarPorEstado(estado: EstadoNovedad): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('novedad')
    .select('*', { count: 'exact', head: true })
    .eq('estado', estado)
  if (error) throw new Error(`novedades.contar: ${error.message}`)
  return count ?? 0
}
