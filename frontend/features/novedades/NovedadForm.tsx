'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Prioridad, EstadoNovedad, Vehiculo, Novedad, Region } from '@/lib/supabase/types'

const PRIORIDADES: { value: Prioridad; label: string; cls: string }[] = [
  { value: 'baja',    label: 'Baja',    cls: 'text-success-dark bg-success-pale border-success/20' },
  { value: 'media',   label: 'Media',   cls: 'text-warning-dark bg-warning-pale border-warning/20' },
  { value: 'alta',    label: 'Alta',    cls: 'text-danger-dark bg-danger-pale border-danger/20' },
  { value: 'critica', label: 'Crítica', cls: 'text-danger-dark bg-danger-pale border-danger/30' },
]

const ESTADOS: { value: EstadoNovedad; label: string }[] = [
  { value: 'abierta',    label: 'Abierta' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'cerrada',    label: 'Cerrada' },
]

interface Props {
  vehiculos: Pick<Vehiculo, 'id' | 'placa' | 'marca' | 'linea'>[]
  regiones: Region[]
  novedad?: Novedad
  backHref: string
  successHref: string
}

export function NovedadForm({ vehiculos, regiones, novedad, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!novedad

  const [form, setForm] = useState({
    titulo: novedad?.titulo ?? '',
    descripcion: novedad?.descripcion ?? '',
    prioridad: (novedad?.prioridad ?? 'media') as Prioridad,
    vehiculo_id: novedad?.vehiculo_id ?? '',
    estado: (novedad?.estado ?? 'abierta') as EstadoNovedad,
    region_id: novedad?.region_id ?? (regiones[0]?.id ?? ''),
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

    setGuardando(true)
    setError('')

    const supabase = createClient()
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion || null,
      prioridad: form.prioridad,
      vehiculo_id: form.vehiculo_id || null,
    }

    try {
      if (isEdit) {
        const { error: err } = await supabase
          .from('novedad')
          .update({ ...payload, estado: form.estado })
          .eq('id', novedad!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('novedad')
          .insert({ ...payload, region_id: form.region_id, origen_tipo: 'manual', estado: 'abierta' })
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
        <Field label="Título *">
          <input
            type="text"
            value={form.titulo}
            onChange={e => set('titulo', e.target.value)}
            required
            maxLength={200}
            placeholder="Descripción breve del problema"
            className={inputCls}
          />
        </Field>

        <Field label="Descripción detallada">
          <textarea
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="¿Qué ocurrió? ¿Cuándo? ¿Dónde? ¿Quién lo reportó?"
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {regiones.length > 1 && (
            <Field label="Región *">
              <select value={form.region_id} onChange={e => set('region_id', e.target.value)} required className={inputCls}>
                <option value="">— Seleccionar región —</option>
                {regiones.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Prioridad">
            <select value={form.prioridad} onChange={e => set('prioridad', e.target.value as Prioridad)} className={inputCls}>
              {PRIORIDADES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Vehículo relacionado">
            <select value={form.vehiculo_id} onChange={e => set('vehiculo_id', e.target.value)} className={inputCls}>
              <option value="">— Sin vehículo —</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa}{v.marca ? ` · ${v.marca}` : ''}{v.linea ? ` ${v.linea}` : ''}
                </option>
              ))}
            </select>
          </Field>

          {isEdit && (
            <Field label="Estado">
              <select value={form.estado} onChange={e => set('estado', e.target.value as EstadoNovedad)} className={inputCls}>
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
        <button type="button" onClick={() => router.push(backHref)} className="px-5 py-2.5 text-sm font-medium text-ink-500 border border-border rounded-lg hover:bg-surface-raised transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary/20">
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar novedad'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 bg-surface placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
