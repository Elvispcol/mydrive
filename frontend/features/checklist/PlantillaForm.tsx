'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PlantillaConItems, ItemInput } from '@/lib/services/checklist'

interface ItemRow extends ItemInput {
  _key: string
}

interface Props {
  plantilla?: PlantillaConItems
  backHref:   string
  successHref: string
}

function newKey() { return Math.random().toString(36).slice(2) }

export function PlantillaForm({ plantilla, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!plantilla

  const [nombre, setNombre] = useState(plantilla?.nombre ?? '')
  const [activa, setActiva] = useState(plantilla?.activa ?? true)
  const [items,  setItems]  = useState<ItemRow[]>(
    plantilla?.items.map(it => ({ _key: newKey(), texto: it.texto, critico: it.critico, orden: it.orden }))
    ?? [{ _key: newKey(), texto: '', critico: false, orden: 1 }],
  )
  const [guardando, setGuardando]   = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError]           = useState('')

  function addItem() {
    setItems(prev => [...prev, { _key: newKey(), texto: '', critico: false, orden: prev.length + 1 }])
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(it => it._key !== key))
  }

  function updateItem(key: string, field: 'texto' | 'critico', value: string | boolean) {
    setItems(prev => prev.map(it => it._key === key ? { ...it, [field]: value } : it))
  }

  function moveItem(key: string, dir: -1 | 1) {
    setItems(prev => {
      const idx = prev.findIndex(it => it._key === key)
      if (idx < 0) return prev
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre de la plantilla es obligatorio.'); return }
    const itemsValidos = items.filter(it => it.texto.trim())
    if (itemsValidos.length === 0) { setError('Agrega al menos un ítem.'); return }

    setGuardando(true)
    setError('')
    const supabase = createClient()

    try {
      if (isEdit) {
        const { error: updErr } = await supabase
          .from('checklist_plantilla')
          .update({ nombre: nombre.trim(), activa })
          .eq('id', plantilla!.id)
        if (updErr) throw updErr

        await supabase.from('checklist_item').delete().eq('plantilla_id', plantilla!.id)

        const { error: itemErr } = await supabase.from('checklist_item').insert(
          itemsValidos.map((it, i) => ({
            plantilla_id: plantilla!.id,
            texto:   it.texto.trim(),
            critico: it.critico,
            orden:   i + 1,
          })),
        )
        if (itemErr) throw itemErr
      } else {
        const { data: nueva, error: crtErr } = await supabase
          .from('checklist_plantilla')
          .insert({ nombre: nombre.trim(), activa })
          .select()
          .single()
        if (crtErr) throw crtErr

        const { error: itemErr } = await supabase.from('checklist_item').insert(
          itemsValidos.map((it, i) => ({
            plantilla_id: (nueva as { id: string }).id,
            texto:   it.texto.trim(),
            critico: it.critico,
            orden:   i + 1,
          })),
        )
        if (itemErr) throw itemErr
      }
      router.push(successHref)
      router.refresh()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Error inesperado')
    } finally {
      setGuardando(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta plantilla y todos sus ítems?')) return
    setEliminando(true)
    const supabase = createClient()
    try {
      await supabase.from('checklist_item').delete().eq('plantilla_id', plantilla!.id)
      const { error: err } = await supabase.from('checklist_plantilla').delete().eq('id', plantilla!.id)
      if (err) throw err
      router.push(successHref)
      router.refresh()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Error al eliminar')
      setEliminando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos de la plantilla */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-2">Plantilla</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <Field label="Nombre *">
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required maxLength={200} placeholder="Ej. Inspección diaria vehículo liviano" className={cls} />
            </Field>
          </div>
          <div>
            <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5 block">Estado</span>
            <button
              type="button"
              onClick={() => setActiva(a => !a)}
              className={`w-full px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${
                activa
                  ? 'bg-success-pale text-success-dark border-success/30 hover:bg-success-pale/70'
                  : 'bg-surface text-ink-400 border-border hover:bg-surface-raised'
              }`}
            >
              {activa ? '✓ Activa' : 'Inactiva'}
            </button>
          </div>
        </div>
      </section>

      {/* Ítems */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
            Ítems de inspección
            <span className="ml-2 text-xs font-normal text-ink-400 normal-case tracking-normal">
              ({items.filter(it => it.texto.trim()).length} ítems)
            </span>
          </h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary-pale/30 rounded-lg hover:bg-primary-pale transition-colors"
          >
            <IconPlus /> Agregar ítem
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-ink-400 italic py-4 text-center">Sin ítems. Agrega al menos uno.</p>
        )}

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item._key} className="flex items-center gap-2 group">
              {/* Orden */}
              <span className="text-xs text-ink-300 w-5 text-right shrink-0">{idx + 1}</span>

              {/* Mover */}
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => moveItem(item._key, -1)} disabled={idx === 0} className="w-5 h-4 flex items-center justify-center text-ink-200 hover:text-ink-500 disabled:opacity-30">▲</button>
                <button type="button" onClick={() => moveItem(item._key, 1)}  disabled={idx === items.length - 1} className="w-5 h-4 flex items-center justify-center text-ink-200 hover:text-ink-500 disabled:opacity-30">▼</button>
              </div>

              {/* Texto */}
              <input
                type="text"
                value={item.texto}
                onChange={e => updateItem(item._key, 'texto', e.target.value)}
                placeholder={`Ítem ${idx + 1}...`}
                maxLength={300}
                className={`${cls} flex-1`}
              />

              {/* Crítico */}
              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={item.critico}
                  onChange={e => updateItem(item._key, 'critico', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-danger focus:ring-danger/30"
                />
                <span className="text-xs font-medium text-danger-dark select-none">Crítico</span>
              </label>

              {/* Eliminar */}
              <button
                type="button"
                onClick={() => removeItem(item._key)}
                className="w-7 h-7 flex items-center justify-center text-ink-200 hover:text-danger-dark hover:bg-danger-pale rounded transition-colors shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-danger-dark bg-danger-pale border border-danger/20 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push(backHref)} className="px-5 py-2.5 text-sm font-medium text-ink-500 border border-border rounded-lg hover:bg-surface-raised transition-colors">Cancelar</button>
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={eliminando} className="px-5 py-2.5 text-sm font-medium text-danger-dark border border-danger/30 rounded-lg hover:bg-danger-pale disabled:opacity-50 transition-colors">
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>
        <button type="submit" disabled={guardando} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm shadow-primary/20">
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear plantilla'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
function IconPlus() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
}
const cls = 'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 bg-surface placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
