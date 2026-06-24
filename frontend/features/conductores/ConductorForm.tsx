'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TipoLicencia, Region } from '@/lib/supabase/types'
import type { ConductorConVehiculo } from '@/lib/services/conductores'

const TIPOS_LICENCIA: TipoLicencia[] = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']

interface Props {
  regiones: Region[]
  conductor?: ConductorConVehiculo
  backHref: string
  successHref: string
}

export function ConductorForm({ regiones, conductor, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!conductor

  const [form, setForm] = useState({
    nombre: conductor?.nombre ?? '',
    email: conductor?.email ?? '',
    password: '',
    documento: conductor?.documento ?? '',
    celular: conductor?.celular ?? '',
    ciudad: conductor?.ciudad ?? '',
    cargo: conductor?.cargo ?? '',
    tipo_licencia: conductor?.tipo_licencia ?? ('' as TipoLicencia | ''),
    licencia_expedicion: conductor?.licencia_expedicion ?? '',
    licencia_vencimiento: conductor?.licencia_vencimiento ?? '',
    fecha_ingreso: conductor?.fecha_ingreso ?? '',
    region_id: conductor?.region?.id ?? (regiones[0]?.id ?? ''),
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }

    if (!isEdit && !form.password) {
      setError('La contraseña es obligatoria al registrar un conductor.')
      return
    }
    if (!isEdit && form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setGuardando(true)
    setError('')

    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      documento: form.documento || null,
      celular: form.celular || null,
      ciudad: form.ciudad || null,
      cargo: form.cargo || null,
      tipo_licencia: (form.tipo_licencia as TipoLicencia) || null,
      licencia_expedicion: form.licencia_expedicion || null,
      licencia_vencimiento: form.licencia_vencimiento || null,
      fecha_ingreso: form.fecha_ingreso || null,
      region_id: form.region_id || null,
    }

    try {
      if (isEdit) {
        const supabase = createClient()
        const { error: err } = await supabase.from('usuario').update(payload).eq('id', conductor!.id)
        if (err) throw err
      } else {
        const res = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, password: form.password, rol: 'conductor' }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Error al registrar conductor')
      }
      router.push(successHref)
      router.refresh()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error inesperado'
      if (msg.includes('already been registered') || msg.includes('already exists')) {
        setError('Ya existe un usuario con ese correo.')
      } else {
        setError(msg)
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos personales */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Datos personales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *">
            <input
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              required
              placeholder="Juan Pérez"
              className={inputCls}
            />
          </Field>

          <Field label="Correo electrónico *">
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              disabled={isEdit}
              placeholder="conductor@empresa.com"
              className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </Field>

          {!isEdit && (
            <Field label="Contraseña inicial *">
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Documento de identidad">
            <input
              type="text"
              value={form.documento}
              onChange={e => set('documento', e.target.value)}
              placeholder="1234567890"
              className={inputCls}
            />
          </Field>

          <Field label="Celular">
            <input
              type="tel"
              value={form.celular}
              onChange={e => set('celular', e.target.value)}
              placeholder="+57 300 000 0000"
              className={inputCls}
            />
          </Field>

          <Field label="Ciudad">
            <input
              type="text"
              value={form.ciudad}
              onChange={e => set('ciudad', e.target.value)}
              placeholder="Bogotá"
              className={inputCls}
            />
          </Field>

          <Field label="Cargo">
            <input
              type="text"
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
              placeholder="Conductor de reparto"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Licencia de conducción */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Licencia de conducción</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Categoría">
            <select value={form.tipo_licencia} onChange={e => set('tipo_licencia', e.target.value)} className={inputCls}>
              <option value="">— Sin especificar —</option>
              {TIPOS_LICENCIA.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Fecha de expedición">
            <input
              type="date"
              value={form.licencia_expedicion}
              onChange={e => set('licencia_expedicion', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Fecha de vencimiento">
            <input
              type="date"
              value={form.licencia_vencimiento}
              onChange={e => set('licencia_vencimiento', e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Vinculación */}
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Vinculación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de ingreso">
            <input
              type="date"
              value={form.fecha_ingreso}
              onChange={e => set('fecha_ingreso', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Región">
            <select value={form.region_id} onChange={e => set('region_id', e.target.value)} className={inputCls}>
              <option value="">— Sin asignar —</option>
              {regiones.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar conductor'}
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
