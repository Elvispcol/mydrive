'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Vehiculo, TipoInfraccion, EstadoMulta } from '@/lib/supabase/types'
import type { MultaConDetalle } from '@/lib/services/multas'

const TIPOS: { value: TipoInfraccion; label: string }[] = [
  { value: 'velocidad',        label: 'Exceso de velocidad' },
  { value: 'senales',          label: 'Señales de tránsito' },
  { value: 'estacionamiento',  label: 'Estacionamiento indebido' },
  { value: 'documentos',       label: 'Documentos' },
  { value: 'alcoholemia',      label: 'Alcoholemia' },
  { value: 'otro',             label: 'Otro' },
]

const ESTADOS: { value: EstadoMulta; label: string }[] = [
  { value: 'pendiente',   label: 'Pendiente' },
  { value: 'en_disputa',  label: 'En disputa' },
  { value: 'pagada',      label: 'Pagada' },
  { value: 'exonerada',   label: 'Exonerada' },
  { value: 'vencida',     label: 'Vencida' },
]

interface Props {
  vehiculos:   Pick<Vehiculo, 'id' | 'placa' | 'marca' | 'region_id'>[]
  conductores: { id: string; nombre: string }[]
  multa?:      MultaConDetalle
  backHref:    string
  successHref: string
}

export function MultaForm({ vehiculos, conductores, multa, backHref, successHref }: Props) {
  const router   = useRouter()
  const isEdit   = !!multa
  const today    = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    vehiculo_id:           multa?.vehiculo_id          ?? (vehiculos[0]?.id ?? ''),
    conductor_id:          multa?.conductor_id         ?? '',
    fecha_infraccion:      multa?.fecha_infraccion     ?? today,
    fecha_notificacion:    multa?.fecha_notificacion   ?? '',
    tipo:                  (multa?.tipo ?? 'velocidad') as TipoInfraccion,
    descripcion:           multa?.descripcion          ?? '',
    valor:                 multa?.valor?.toString()    ?? '',
    descuento_pronto_pago: multa?.descuento_pronto_pago?.toString() ?? '',
    fecha_limite_pago:     multa?.fecha_limite_pago    ?? '',
    estado:                (multa?.estado ?? 'pendiente') as EstadoMulta,
    fecha_pago:            multa?.fecha_pago           ?? '',
    observaciones:         multa?.observaciones        ?? '',
  })
  const [guardando, setGuardando]   = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError]           = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const vehiculoSeleccionado = vehiculos.find(v => v.id === form.vehiculo_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vehiculo_id)       { setError('Selecciona un vehículo.'); return }
    if (!form.fecha_infraccion)  { setError('La fecha de infracción es obligatoria.'); return }

    setGuardando(true)
    setError('')
    const supabase = createClient()

    const payload = {
      conductor_id:         form.conductor_id         || null,
      fecha_infraccion:     form.fecha_infraccion,
      fecha_notificacion:   form.fecha_notificacion   || null,
      tipo:                 form.tipo,
      descripcion:          form.descripcion          || null,
      valor:                form.valor                ? parseFloat(form.valor)                : null,
      descuento_pronto_pago: form.descuento_pronto_pago ? parseFloat(form.descuento_pronto_pago) : null,
      fecha_limite_pago:    form.fecha_limite_pago    || null,
      estado:               form.estado,
      fecha_pago:           form.estado === 'pagada' ? (form.fecha_pago || null) : null,
      observaciones:        form.observaciones        || null,
    }

    try {
      if (isEdit) {
        const { error: err } = await supabase.from('multa_infraccion').update(payload).eq('id', multa!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('multa_infraccion').insert({
          ...payload,
          vehiculo_id: form.vehiculo_id,
          region_id:   vehiculoSeleccionado?.region_id ?? '',
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
    if (!confirm('¿Eliminar esta infracción?')) return
    setEliminando(true)
    const supabase = createClient()
    try {
      const { error: err } = await supabase.from('multa_infraccion').delete().eq('id', multa!.id)
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
      {/* Infracción */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-2">Infracción</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehículo *">
            <select
              value={form.vehiculo_id}
              onChange={e => set('vehiculo_id', e.target.value)}
              required
              disabled={isEdit}
              className={`${cls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="">— Seleccionar —</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.placa}{v.marca ? ` · ${v.marca}` : ''}</option>
              ))}
            </select>
          </Field>

          <Field label="Conductor">
            <select value={form.conductor_id} onChange={e => set('conductor_id', e.target.value)} className={cls}>
              <option value="">— Sin especificar —</option>
              {conductores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Fecha infracción *">
            <input type="date" value={form.fecha_infraccion} onChange={e => set('fecha_infraccion', e.target.value)} required className={cls} />
          </Field>
          <Field label="Fecha notificación">
            <input type="date" value={form.fecha_notificacion} onChange={e => set('fecha_notificacion', e.target.value)} className={cls} />
          </Field>
          <Field label="Tipo *">
            <select value={form.tipo} onChange={e => set('tipo', e.target.value as TipoInfraccion)} required className={cls}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Descripción / detalle">
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={2} maxLength={500} className={`${cls} resize-none`} placeholder="Descripción de la infracción..." />
        </Field>
      </section>

      {/* Valores y estado */}
      <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900 uppercase tracking-wider mb-2">Valores y estado</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Valor de la multa">
            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)} min={0} step={0.01} placeholder="Ej. 350000" className={cls} />
          </Field>
          <Field label="Descuento pronto pago">
            <input type="number" value={form.descuento_pronto_pago} onChange={e => set('descuento_pronto_pago', e.target.value)} min={0} step={0.01} placeholder="Ej. 175000" className={cls} />
          </Field>
          <Field label="Fecha límite pago">
            <input type="date" value={form.fecha_limite_pago} onChange={e => set('fecha_limite_pago', e.target.value)} className={cls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Estado *">
            <select value={form.estado} onChange={e => set('estado', e.target.value as EstadoMulta)} required className={cls}>
              {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          {form.estado === 'pagada' && (
            <Field label="Fecha de pago">
              <input type="date" value={form.fecha_pago} onChange={e => set('fecha_pago', e.target.value)} className={cls} />
            </Field>
          )}
        </div>

        <Field label="Observaciones">
          <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={2} maxLength={500} className={`${cls} resize-none`} placeholder="Notas adicionales..." />
        </Field>
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar infracción'}
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

const cls = 'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 bg-surface placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
