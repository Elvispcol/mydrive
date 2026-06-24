'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Rol, Region } from '@/lib/supabase/types'
import type { UsuarioConRegion } from '@/lib/services/usuarios_sistema'

const ROLES: { value: Rol; label: string }[] = [
  { value: 'director', label: 'Director' },
  { value: 'admin_apoyo', label: 'Admin / Apoyo' },
  { value: 'conductor', label: 'Conductor' },
]

interface Props {
  regiones: Region[]
  usuario?: UsuarioConRegion
  backHref: string
  successHref: string
}

export function UsuarioForm({ regiones, usuario, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!usuario

  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    email: usuario?.email ?? '',
    password: '',
    documento: usuario?.documento ?? '',
    celular: usuario?.celular ?? '',
    ciudad: usuario?.ciudad ?? '',
    cargo: usuario?.cargo ?? '',
    rol: (usuario?.rol ?? 'admin_apoyo') as Rol,
    region_id: usuario?.region?.id ?? (regiones[0]?.id ?? ''),
    fecha_ingreso: usuario?.fecha_ingreso ?? '',
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
      setError('La contraseña es obligatoria al crear un usuario.')
      return
    }
    if (!isEdit && form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      if (isEdit) {
        const supabase = createClient()
        const { error: err } = await supabase.from('usuario').update({
          nombre: form.nombre.trim(),
          documento: form.documento || null,
          celular: form.celular || null,
          ciudad: form.ciudad || null,
          cargo: form.cargo || null,
          rol: form.rol,
          region_id: form.region_id || null,
          fecha_ingreso: form.fecha_ingreso || null,
        }).eq('id', usuario!.id)
        if (err) throw err
      } else {
        const res = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: form.nombre.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            documento: form.documento || null,
            celular: form.celular || null,
            ciudad: form.ciudad || null,
            cargo: form.cargo || null,
            rol: form.rol,
            region_id: form.region_id || null,
            fecha_ingreso: form.fecha_ingreso || null,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Error al crear usuario')
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
      <section className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Datos del usuario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *">
            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Nombre Apellido" className={inputCls} />
          </Field>

          <Field label="Correo electrónico *">
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              disabled={isEdit}
              placeholder="usuario@empresa.com"
              className={`${inputCls} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </Field>

          {!isEdit && (
            <Field label="Contraseña inicial *">
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required={!isEdit}
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Rol *">
            <select value={form.rol} onChange={e => set('rol', e.target.value as Rol)} required className={inputCls}>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Región">
            <select value={form.region_id} onChange={e => set('region_id', e.target.value)} className={inputCls}>
              <option value="">— Sin asignar —</option>
              {regiones.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Documento">
            <input type="text" value={form.documento} onChange={e => set('documento', e.target.value)} placeholder="Cédula / Pasaporte" className={inputCls} />
          </Field>

          <Field label="Celular">
            <input type="tel" value={form.celular} onChange={e => set('celular', e.target.value)} placeholder="+57 300 000 0000" className={inputCls} />
          </Field>

          <Field label="Ciudad">
            <input type="text" value={form.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Bogotá" className={inputCls} />
          </Field>

          <Field label="Cargo">
            <input type="text" value={form.cargo} onChange={e => set('cargo', e.target.value)} placeholder="Coordinador de flota" className={inputCls} />
          </Field>

          <Field label="Fecha de ingreso">
            <input type="date" value={form.fecha_ingreso} onChange={e => set('fecha_ingreso', e.target.value)} className={inputCls} />
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
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
