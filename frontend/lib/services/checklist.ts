import { createClient } from '@/lib/supabase/server'
import type { ChecklistPlantilla, ChecklistItem } from '@/lib/supabase/types'

export type PlantillaConItems = ChecklistPlantilla & { items: ChecklistItem[] }

export interface ItemInput {
  texto:   string
  critico: boolean
  orden:   number
}

export async function listarPlantillas(): Promise<PlantillaConItems[]> {
  const supabase = await createClient()
  const { data: plantillas, error } = await supabase
    .from('checklist_plantilla')
    .select('*')
    .order('creado_en', { ascending: false })
  if (error) throw new Error(`checklist.listar: ${error.message}`)
  if (!plantillas?.length) return []

  const ids = plantillas.map(p => p.id)
  const { data: items } = await supabase
    .from('checklist_item')
    .select('*')
    .in('plantilla_id', ids)
    .order('orden', { ascending: true })

  const itemMap = new Map<string, ChecklistItem[]>()
  for (const item of items ?? []) {
    const arr = itemMap.get(item.plantilla_id) ?? []
    arr.push(item as ChecklistItem)
    itemMap.set(item.plantilla_id, arr)
  }

  return (plantillas as ChecklistPlantilla[]).map(p => ({
    ...p,
    items: itemMap.get(p.id) ?? [],
  }))
}

export async function obtenerPlantillaConItems(id: string): Promise<PlantillaConItems | null> {
  const supabase = await createClient()
  const [{ data: plantilla, error }, { data: items }] = await Promise.all([
    supabase.from('checklist_plantilla').select('*').eq('id', id).single(),
    supabase.from('checklist_item').select('*').eq('plantilla_id', id).order('orden'),
  ])
  if (error || !plantilla) return null
  return {
    ...(plantilla as ChecklistPlantilla),
    items: (items ?? []) as ChecklistItem[],
  }
}

export async function crearPlantilla(nombre: string, items: ItemInput[]): Promise<ChecklistPlantilla> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('checklist_plantilla')
    .insert({ nombre, activa: true })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const plantilla = data as ChecklistPlantilla

  if (items.length > 0) {
    const { error: itemErr } = await supabase.from('checklist_item').insert(
      items.map((it, i) => ({
        plantilla_id: plantilla.id,
        texto:   it.texto,
        critico: it.critico,
        orden:   i + 1,
      })),
    )
    if (itemErr) throw new Error(itemErr.message)
  }
  return plantilla
}

export async function actualizarPlantilla(
  id: string,
  nombre: string,
  activa: boolean,
  items: ItemInput[],
): Promise<void> {
  const supabase = await createClient()

  const { error: updErr } = await supabase
    .from('checklist_plantilla')
    .update({ nombre, activa })
    .eq('id', id)
  if (updErr) throw new Error(updErr.message)

  // Sync items: eliminar todos y re-insertar (plantillas pequeñas <50 items)
  await supabase.from('checklist_item').delete().eq('plantilla_id', id)

  if (items.length > 0) {
    const { error: itemErr } = await supabase.from('checklist_item').insert(
      items.map((it, i) => ({
        plantilla_id: id,
        texto:   it.texto,
        critico: it.critico,
        orden:   i + 1,
      })),
    )
    if (itemErr) throw new Error(itemErr.message)
  }
}

export async function eliminarPlantilla(id: string): Promise<void> {
  const supabase = await createClient()
  // checklist_item tiene ON DELETE CASCADE desde plantilla_id
  const { error } = await supabase.from('checklist_plantilla').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
