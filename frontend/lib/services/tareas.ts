import { createClient } from '@/lib/supabase/server'
import type { Tarea, EstadoTarea } from '@/lib/supabase/types'
import type { Page } from './novedades'

export type TareaConAsignado = Tarea & { asignado: { nombre: string } | null }

export interface ListarTareasOpts {
  estados?: EstadoTarea[]
  cursor?: string
  limit?: number
}

export async function listarTareas(opts: ListarTareasOpts = {}): Promise<Page<TareaConAsignado>> {
  const supabase = await createClient()
  const limit = opts.limit ?? 25

  let query = supabase
    .from('tarea')
    .select('*, asignado: usuario!tarea_asignado_a_fkey(nombre)', { count: 'exact' })
    .order('vence_en', { ascending: true, nullsFirst: false })
    .limit(limit + 1)

  if (opts.estados?.length) query = query.in('estado', opts.estados)
  if (opts.cursor) query = query.gt('vence_en', opts.cursor)

  const { data, error, count } = await query
  if (error) throw new Error(`tareas.listar: ${error.message}`)

  const items = ((data ?? []) as TareaConAsignado[]).slice(0, limit)
  const hasMore = (data?.length ?? 0) > limit

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.vence_en ?? null) : null,
    total: count ?? 0,
  }
}

export async function contarPorEstado(estado: EstadoTarea): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('tarea')
    .select('*', { count: 'exact', head: true })
    .eq('estado', estado)
  if (error) throw new Error(`tareas.contar: ${error.message}`)
  return count ?? 0
}
