'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Vehiculo, EstadoMantenimiento } from '@/lib/supabase/types'
import type { MantenimientoConVehiculo } from '@/lib/services/mantenimientos'

const TIPOS_MANTENIMIENTO = [
  'aceite_y_filtros', 'frenos', 'llantas', 'revision_general',
  'electrico', 'suspension', 'transmision', 'motor',
  'carroceria', 'aires_acondicionado', 'otro',
]

const ESTADOS_MANTENIMIENTO: { value: EstadoMantenimiento; label: string }[] = [
  { value: 'programado',  label: 'Programado' },
  { value: 'en_proceso',  label: 'En proceso' },
  { value: 'completado',  label: 'Completado' },
  { value: 'cancelado',   label: 'Cancelado' },
]

interface Props {
  vehiculos: Pick<Vehiculo, 'id' | 'placa' | 'marca' | 'linea' | 'km_actual'>[]
  mantenimiento?: MantenimientoConVehiculo
  backHref: string
  successHref: string
  preseleccionVehiculoId?: string
}

export function MantenimientoForm({
  vehiculos, mantenimiento, backHref, successHref, preseleccionVehiculoId
}: Props) {
  const router = useRouter()
  const isEdit = !!mantenimiento

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    vehiculo_id: mantenimiento?.vehiculo_id ?? preseleccionVehiculoId ?? (vehiculos[0]?.id ?? ''),
    tipo: mantenimiento?.tipo ?? '',
    descripcion: mantenimiento?.descripcion ?? '',
    costo: mantenimiento?.costo?.toString() ?? '',
    fecha: mantenimiento?.fecha ?? today,
    estado: (mantenimiento?.estado ?? 'programado') as EstadoMantenimiento,
    km_en_servicio: mantenimiento?.km_en_servicio?.toString() ?? '',
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const vehiculoSeleccionado = vehiculos.find(v => v.id === form.vehiculo_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vehiculo_id || !form.descripcion.trim() || !form.fecha) {
      setError('Vehículo, descripción y fecha son obligatorios.')
      return
    }

    setGuardando(true)
    setError('')

    const supabase = createClient()
    const payload = {
      vehiculo_id: form.vehiculo_id,
      tipo: form.tipo || 'otro',
      descripcion: form.descripcion.trim(),
      costo: form.costo ? parseFloat(form.costo) : null,
      fecha: form.fecha,
      estado: form.estado,
      km_en_servicio: form.km_en_servicio ? parseInt(form.km_en_servicio) : null,
    }

    try {
      if (isEdit) {
        const update: Record<string, unknown> = { ...payload }
        if (form.estado === 'completado') update.completado_en = today
        const { error: err } = await supabase.from('mantenimiento').update(update).eq('id', mantenimiento!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('mantenimiento').insert(payload)
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
      {/* Vehículo */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4 uppercase tracking-wider">Vehículo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehículo *">
            <select
              value={form.vehiculo_id}
              onChange={e => set('vehiculo_id', e.target.value)}
              required
              disabled={isEdit}
              className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="">— Seleccionar vehículo —</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa}{v.marca ? ` · ${v.marca}` : ''}{v.linea ? ` ${v.linea}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Km al momento del servicio">
            <input
              type="number"
              value={form.km_en_servicio}
              onChange={e => set('km_en_servicio', e.target.value)}
              min={0}
              placeholder={vehiculoSeleccionado?.km_actual?.toString() ?? '0'}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Detalle del mantenimiento */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-2 uppercase tracking-wider">Detalle del trabajo</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de mantenimiento">
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>
              <option value="">— Seleccionar —</option>
              {TIPOS_MANTENIMIENTO.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </Field>

          <Field label="Fecha *">
            <input
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              required
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Descripción del trabajo *">
          <textarea
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            required
            rows={3}
            maxLength={2000}
            placeholder="Describe el trabajo realizado o a realizar..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Costo (COP)">
            <input
              type="number"
              value={form.costo}
              onChange={e => set('costo', e.target.value)}
              min={0}
              step="0.01"
              placeholder="0.00"
              className={inputCls}
            />
          </Field>

          <Field label="Estado">
            <select value={form.estado} onChange={e => set('estado', e.target.value as EstadoMantenimiento)} className={inputCls}>
              {ESTADOS_MANTENIMIENTO.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar mantenimiento'}
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
