'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Vehiculo, EstadoVehiculo, Region } from '@/lib/supabase/types'

const TIPOS_VEHICULO = ['sedan', 'suv', 'pickup', 'furgon', 'camion', 'van', 'moto', 'otro']
const ESTADOS_VEHICULO: { value: EstadoVehiculo; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'vendido', label: 'Vendido' },
]

interface Props {
  regiones: Region[]
  vehiculo?: Vehiculo
  backHref: string
  successHref: string
}

export function VehiculoForm({ regiones, vehiculo, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!vehiculo

  const [form, setForm] = useState({
    placa: vehiculo?.placa ?? '',
    marca: vehiculo?.marca ?? '',
    linea: vehiculo?.linea ?? '',
    modelo_anio: vehiculo?.modelo_anio?.toString() ?? '',
    tipo: vehiculo?.tipo ?? '',
    color: vehiculo?.color ?? '',
    cilindraje: vehiculo?.cilindraje?.toString() ?? '',
    numero_motor: vehiculo?.numero_motor ?? '',
    numero_chasis: vehiculo?.numero_chasis ?? '',
    km_actual: vehiculo?.km_actual?.toString() ?? '0',
    region_id: vehiculo?.region_id ?? (regiones[0]?.id ?? ''),
    estado: (vehiculo?.estado ?? 'activo') as EstadoVehiculo,
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.placa.trim() || !form.region_id) {
      setError('La placa y la región son obligatorias.')
      return
    }

    setGuardando(true)
    setError('')

    const supabase = createClient()
    const payload = {
      placa: form.placa.toUpperCase().trim(),
      marca: form.marca || null,
      linea: form.linea || null,
      modelo_anio: form.modelo_anio ? parseInt(form.modelo_anio) : null,
      tipo: form.tipo || null,
      color: form.color || null,
      cilindraje: form.cilindraje ? parseInt(form.cilindraje) : null,
      numero_motor: form.numero_motor || null,
      numero_chasis: form.numero_chasis || null,
      km_actual: parseInt(form.km_actual) || 0,
      region_id: form.region_id,
      estado: form.estado,
    }

    try {
      if (isEdit) {
        const { error: err } = await supabase.from('vehiculo').update(payload).eq('id', vehiculo!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('vehiculo').insert(payload)
        if (err) throw err
      }
      router.push(successHref)
      router.refresh()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error inesperado'
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('Ya existe un vehículo con esa placa.')
      } else {
        setError(msg)
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identificación */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Identificación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Placa *" required>
            <input
              type="text"
              value={form.placa}
              onChange={e => set('placa', e.target.value.toUpperCase())}
              required
              maxLength={10}
              placeholder="ABC123"
              className={inputCls}
            />
          </Field>

          <Field label="Número de motor">
            <input type="text" value={form.numero_motor} onChange={e => set('numero_motor', e.target.value)} className={inputCls} />
          </Field>

          <Field label="Número de chasis">
            <input type="text" value={form.numero_chasis} onChange={e => set('numero_chasis', e.target.value)} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Datos del vehículo */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Datos del vehículo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Marca">
            <input type="text" value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Toyota" className={inputCls} />
          </Field>

          <Field label="Línea / Modelo">
            <input type="text" value={form.linea} onChange={e => set('linea', e.target.value)} placeholder="Hilux" className={inputCls} />
          </Field>

          <Field label="Año">
            <input
              type="number"
              value={form.modelo_anio}
              onChange={e => set('modelo_anio', e.target.value)}
              min={1990}
              max={new Date().getFullYear() + 1}
              placeholder="2023"
              className={inputCls}
            />
          </Field>

          <Field label="Tipo">
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>
              <option value="">— Seleccionar —</option>
              {TIPOS_VEHICULO.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </Field>

          <Field label="Color">
            <input type="text" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Blanco" className={inputCls} />
          </Field>

          <Field label="Cilindraje (cc)">
            <input
              type="number"
              value={form.cilindraje}
              onChange={e => set('cilindraje', e.target.value)}
              min={0}
              placeholder="2000"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Operación */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Operación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Km actual">
            <input
              type="number"
              value={form.km_actual}
              onChange={e => set('km_actual', e.target.value)}
              min={0}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          <Field label="Región *" required>
            <select value={form.region_id} onChange={e => set('region_id', e.target.value)} required className={inputCls}>
              <option value="">— Seleccionar —</option>
              {regiones.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Estado">
            <select value={form.estado} onChange={e => set('estado', e.target.value as EstadoVehiculo)} className={inputCls}>
              {ESTADOS_VEHICULO.map(s => (
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear vehículo'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
