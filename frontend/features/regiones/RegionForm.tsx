'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Region } from '@/lib/supabase/types'

interface Props {
  region?: Region
  backHref: string
  successHref: string
}

export function RegionForm({ region, backHref, successHref }: Props) {
  const router = useRouter()
  const isEdit = !!region

  const [nombre, setNombre] = useState(region?.nombre ?? '')
  const [activo, setActivo] = useState(region?.activo ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre de la región es obligatorio.')
      return
    }

    setGuardando(true)
    setError('')

    const supabase = createClient()
    try {
      if (isEdit) {
        const { error: err } = await supabase
          .from('region')
          .update({ nombre: nombre.trim(), activo })
          .eq('id', region!.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('region')
          .insert({ nombre: nombre.trim() })
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
        <h2 className="text-sm font-semibold text-ink-900 mb-2">Datos de la región</h2>

        <Field label="Nombre *">
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            maxLength={100}
            placeholder="Ej: Caribe, Andina, Bogotá..."
            className={inputCls}
          />
        </Field>

        {isEdit && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-border rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-ink-700">Región activa</span>
          </label>
        )}
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
          {guardando ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear región'}
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
