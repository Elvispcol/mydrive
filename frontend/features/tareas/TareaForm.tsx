'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Prioridad, EstadoTarea, Region } from '@/lib/supabase/types'
import type { TareaConAsignado } from '@/lib/services/tareas'

const PRIORIDADES: { value: Prioridad; label: string }[] = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

const ESTADOS: { value: EstadoTarea; label: string }[] = [
  { value: 'abierta',    label: 'Abierta' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'cerrada',    label: 'Cerrada' },
]

interface Props {
  regiones: Region[]
  usuarios: { id: string; nombre: string }[]
  tarea?: TareaConAsignado
  backHref: string
  successHref: string
}

export function TareaForm({ regiones, usuarios, tarea, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!tarea

  const [form, setForm] = useState({
    titulo: tarea?.titulo ?? '',
    descripcion: tarea?.descripcion ?? '',
    prioridad: (tarea?.prioridad ?? 'media') as Prioridad,
    region_id: tarea?.region_id ?? (regiones[0]?.id ?? ''),
    asignado_a: tarea?.asignado_a ?? '',
    vence_en: tarea?.vence_en ?? '',
    estado: (tarea?.estado ?? 'abierta') as EstadoTarea,
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) {
      setError('El título es obligatorio.')
      return
    }
    if (!isEdit && !form.region_id) {
      setError('Selecciona una región.')
      return
    }

    setGuardando(true)
    setError('')

    const supabase = createClient()

    try {
      if (isEdit) {
        const { error: err } = await supabase.from('tarea').update({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || null,
          prioridad: form.prioridad,
          asignado_a: form.asignado_a || null,
          vence_en: form.vence_en || null,
          estado: form.estado,
        }).eq('id', tarea!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('tarea').insert({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || null,
          prioridad: form.prioridad,
          region_id: form.region_id,
          asignado_a: form.asignado_a || null,
          vence_en: form.vence_en || null,
          estado: 'abierta',
        })
        if (err) throw err
      }
      router.push(successHref)
      router.refresh()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Error inesperado')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-2 uppercase tracking-wider">Detalle</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Título *">
            <input
              type="text"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              required
              maxLength={200}
              placeholder="¿Qué hay que hacer?"
              className={inputCls}
            />
          </Field>

          <Field label="Prioridad">
            <select value={form.prioridad} onChange={e => set('prioridad', e.target.value as Prioridad)} className={inputCls}>
              {PRIORIDADES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Instrucciones, contexto adicional..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {regiones.length > 1 && !isEdit && (
            <Field label="Región *">
              <select value={form.region_id} onChange={e => set('region_id', e.target.value)} required className={inputCls}>
                <option value="">— Seleccionar —</option>
                {regiones.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Asignada a">
            <select value={form.asignado_a} onChange={e => set('asignado_a', e.target.value)} className={inputCls}>
              <option value="">— Sin asignar —</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Fecha límite">
            <input
              type="date"
              value={form.vence_en}
              onChange={e => set('vence_en', e.target.value)}
              className={inputCls}
            />
          </Field>

          {isEdit && (
            <Field label="Estado">
              <select value={form.estado} onChange={e => set('estado', e.target.value as EstadoTarea)} className={inputCls}>
                {ESTADOS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
      </section>

      {error && (
        <p className="text-sm text-danger-dark bg-danger-pale border border-danger/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="px-5 py-2.5 text-sm font-medium text-ink-500 border border-border rounded-lg hover:bg-surface-raised transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary/20"
        >
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear tarea'}
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

const inputCls =
  'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 bg-surface placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
