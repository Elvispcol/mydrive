'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DocumentoVehiculo, TipoDocumentoVehiculo } from '@/lib/supabase/types'

const TIPOS: { value: TipoDocumentoVehiculo; label: string }[] = [
  { value: 'soat',               label: 'SOAT' },
  { value: 'tecnomecanica',      label: 'Tecno-mecánica' },
  { value: 'poliza_rc',          label: 'Póliza RC' },
  { value: 'poliza_todo_riesgo', label: 'Póliza Todo Riesgo' },
  { value: 'tarjeta_operacion',  label: 'Tarjeta de Operación' },
  { value: 'otro',               label: 'Otro' },
]

interface Props {
  vehiculoId: string
  documento?: DocumentoVehiculo
  backHref: string
  successHref: string
}

export function DocumentoVehiculoForm({ vehiculoId, documento, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!documento

  const [form, setForm] = useState({
    tipo:          (documento?.tipo ?? 'soat') as TipoDocumentoVehiculo,
    numero:        documento?.numero ?? '',
    vence_en:      documento?.vence_en ?? '',
    observaciones: documento?.observaciones ?? '',
  })
  const [guardando, setGuardando]   = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError]           = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vence_en) {
      setError('La fecha de vencimiento es obligatoria.')
      return
    }

    setGuardando(true)
    setError('')
    const supabase = createClient()

    try {
      if (isEdit) {
        const { error: err } = await supabase
          .from('documento_vehiculo')
          .update({
            tipo:          form.tipo,
            numero:        form.numero || null,
            vence_en:      form.vence_en,
            observaciones: form.observaciones || null,
          })
          .eq('id', documento!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('documento_vehiculo')
          .insert({
            vehiculo_id:   vehiculoId,
            tipo:          form.tipo,
            numero:        form.numero || null,
            vence_en:      form.vence_en,
            observaciones: form.observaciones || null,
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

  async function handleDelete() {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return
    setEliminando(true)
    setError('')
    const supabase = createClient()
    try {
      const { error: err } = await supabase
        .from('documento_vehiculo')
        .delete()
        .eq('id', documento!.id)
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
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-2">
          Datos del documento
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de documento *">
            <select
              value={form.tipo}
              onChange={e => set('tipo', e.target.value)}
              required
              className={inputCls}
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Número / código">
            <input
              type="text"
              value={form.numero}
              onChange={e => set('numero', e.target.value)}
              maxLength={100}
              placeholder="Ej. SOA-2024-001"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de vencimiento *">
            <input
              type="date"
              value={form.vence_en}
              onChange={e => set('vence_en', e.target.value)}
              required
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Notas sobre el documento, aseguradora, etc."
            className={`${inputCls} resize-none`}
          />
        </Field>
      </section>

      {error && (
        <p className="text-sm text-danger-dark bg-danger-pale border border-danger/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="px-5 py-2.5 text-sm font-medium text-ink-500 border border-border rounded-lg hover:bg-surface-raised transition-colors"
          >
            Cancelar
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={eliminando}
              className="px-5 py-2.5 text-sm font-medium text-danger-dark border border-danger/30 rounded-lg hover:bg-danger-pale disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary/20"
        >
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar documento'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-700 mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 bg-surface placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
