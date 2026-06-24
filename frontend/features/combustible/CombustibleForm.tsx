'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Vehiculo, TipoCombustible } from '@/lib/supabase/types'
import type { CombustibleConDetalle } from '@/lib/services/combustible'

const TIPOS: { value: TipoCombustible; label: string }[] = [
  { value: 'gasolina',     label: 'Gasolina' },
  { value: 'diesel',       label: 'Diésel' },
  { value: 'gas_natural',  label: 'Gas natural' },
  { value: 'electrico',    label: 'Eléctrico' },
  { value: 'hibrido',      label: 'Híbrido' },
]

interface Props {
  vehiculos: Pick<Vehiculo, 'id' | 'placa' | 'marca' | 'linea' | 'region_id'>[]
  conductores: { id: string; nombre: string }[]
  combustible?: CombustibleConDetalle
  backHref: string
  successHref: string
}

export function CombustibleForm({ vehiculos, conductores, combustible, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!combustible

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    vehiculo_id:      combustible?.vehiculo_id   ?? (vehiculos[0]?.id ?? ''),
    conductor_id:     combustible?.conductor_id  ?? '',
    fecha:            combustible?.fecha         ?? today,
    km_odometro:      combustible?.km_odometro?.toString()  ?? '',
    litros:           combustible?.litros?.toString()       ?? '',
    costo_litro:      combustible?.costo_litro?.toString()  ?? '',
    tipo_combustible: (combustible?.tipo_combustible ?? 'gasolina') as TipoCombustible,
    estacion:         combustible?.estacion      ?? '',
    numero_factura:   combustible?.numero_factura ?? '',
    observaciones:    combustible?.observaciones  ?? '',
  })

  const [guardando, setGuardando]   = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError]           = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const costoTotal = useMemo(() => {
    const litros     = parseFloat(form.litros)
    const costoLitro = parseFloat(form.costo_litro)
    if (!isNaN(litros) && !isNaN(costoLitro) && litros > 0 && costoLitro > 0) {
      return (litros * costoLitro).toFixed(2)
    }
    return null
  }, [form.litros, form.costo_litro])

  const vehiculoSeleccionado = vehiculos.find(v => v.id === form.vehiculo_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const litrosNum = parseFloat(form.litros)
    if (!form.vehiculo_id) { setError('Selecciona un vehículo.'); return }
    if (!form.fecha)        { setError('La fecha es obligatoria.'); return }
    if (isNaN(litrosNum) || litrosNum <= 0) { setError('Los litros deben ser un número positivo.'); return }

    setGuardando(true)
    setError('')
    const supabase = createClient()

    const costoLitroNum = form.costo_litro ? parseFloat(form.costo_litro) : null
    const costoTotalNum = costoTotal ? parseFloat(costoTotal) : null

    try {
      if (isEdit) {
        const { error: err } = await supabase.from('combustible').update({
          conductor_id:     form.conductor_id  || null,
          fecha:            form.fecha,
          km_odometro:      form.km_odometro ? parseInt(form.km_odometro) : null,
          litros:           litrosNum,
          costo_litro:      isNaN(costoLitroNum ?? NaN) ? null : costoLitroNum,
          costo_total:      costoTotalNum,
          tipo_combustible: form.tipo_combustible,
          estacion:         form.estacion      || null,
          numero_factura:   form.numero_factura || null,
          observaciones:    form.observaciones  || null,
        }).eq('id', combustible!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('combustible').insert({
          vehiculo_id:      form.vehiculo_id,
          conductor_id:     form.conductor_id  || null,
          region_id:        vehiculoSeleccionado?.region_id ?? '',
          fecha:            form.fecha,
          km_odometro:      form.km_odometro ? parseInt(form.km_odometro) : null,
          litros:           litrosNum,
          costo_litro:      isNaN(costoLitroNum ?? NaN) ? null : costoLitroNum,
          costo_total:      costoTotalNum,
          tipo_combustible: form.tipo_combustible,
          estacion:         form.estacion      || null,
          numero_factura:   form.numero_factura || null,
          observaciones:    form.observaciones  || null,
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
    if (!confirm('¿Eliminar este registro de combustible?')) return
    setEliminando(true)
    setError('')
    const supabase = createClient()
    try {
      const { error: err } = await supabase.from('combustible').delete().eq('id', combustible!.id)
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
      {/* Sección principal */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-2">
          Datos del abastecimiento
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehículo *">
            <select
              value={form.vehiculo_id}
              onChange={e => set('vehiculo_id', e.target.value)}
              required
              disabled={isEdit}
              className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="">— Seleccionar —</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa}{v.marca ? ` · ${v.marca}` : ''}{v.linea ? ` ${v.linea}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Conductor">
            <select
              value={form.conductor_id}
              onChange={e => set('conductor_id', e.target.value)}
              className={inputCls}
            >
              <option value="">— Sin especificar —</option>
              {conductores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Fecha *">
            <input
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Tipo de combustible *">
            <select
              value={form.tipo_combustible}
              onChange={e => set('tipo_combustible', e.target.value as TipoCombustible)}
              required
              className={inputCls}
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Km odómetro">
            <input
              type="number"
              value={form.km_odometro}
              onChange={e => set('km_odometro', e.target.value)}
              min={0}
              placeholder="Ej. 45000"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Sección de costos */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-2">
          Cantidades y costos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Litros cargados *">
            <input
              type="number"
              value={form.litros}
              onChange={e => set('litros', e.target.value)}
              required
              min={0.01}
              step={0.01}
              placeholder="Ej. 40.00"
              className={inputCls}
            />
          </Field>

          <Field label="Costo por litro">
            <input
              type="number"
              value={form.costo_litro}
              onChange={e => set('costo_litro', e.target.value)}
              min={0}
              step={0.001}
              placeholder="Ej. 6.500"
              className={inputCls}
            />
          </Field>

          <div>
            <span className="text-xs font-semibold text-ink-700 mb-1.5 block">
              Costo total
            </span>
            <div className={`${inputCls} bg-surface-raised text-ink-500 flex items-center`}>
              {costoTotal ? (
                <span className="font-semibold text-ink-900">${parseFloat(costoTotal).toLocaleString('es-CO')}</span>
              ) : (
                <span className="text-ink-300 italic">Calculado automáticamente</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Estación / grifo">
            <input
              type="text"
              value={form.estacion}
              onChange={e => set('estacion', e.target.value)}
              maxLength={200}
              placeholder="Nombre de la estación de servicio"
              className={inputCls}
            />
          </Field>

          <Field label="N.° factura">
            <input
              type="text"
              value={form.numero_factura}
              onChange={e => set('numero_factura', e.target.value)}
              maxLength={100}
              placeholder="Ej. FE-2024-001234"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Notas adicionales..."
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar carga'}
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
