import { createClient } from '@/lib/supabase/server'
import type { Tarea, EstadoTarea, Prioridad } from '@/lib/supabase/types'
import type { Page } from './novedades'

export type TareaConAsignado = Tarea & { asignado: { nombre: string } | null }

export interface TareaInput {
  titulo: string
  descripcion: string | null
  prioridad: Prioridad
  region_id: string
  asignado_a: string | null
  vence_en: string | null
}

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

  const raw = (data ?? []).slice(0, limit)
  const hasMore = (data?.length ?? 0) > limit
  const items: TareaConAsignado[] = raw.map((row: unknown) => {
    const r = row as Record<string, unknown>
    return {
      ...r,
      asignado: Array.isArray(r.asignado) ? r.asignado[0] ?? null : r.asignado ?? null,
    } as TareaConAsignado
  })

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.vence_en ?? null) : null,
    total: count ?? 0,
  }
}

export async function obtenerTarea(id: string): Promise<TareaConAsignado | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tarea')
    .select('*, asignado: usuario!tarea_asignado_a_fkey(nombre)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  const row = data as unknown as Record<string, unknown>
  return {
    ...row,
    asignado: Array.isArray(row.asignado) ? row.asignado[0] ?? null : row.asignado ?? null,
  } as TareaConAsignado
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
