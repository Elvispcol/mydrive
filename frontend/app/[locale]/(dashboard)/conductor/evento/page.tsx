'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIPOS_EVENTO = [
  'Choque / colisión',
  'Daño mecánico',
  'Robo / intento de robo',
  'Accidente personal',
  'Otro',
]

export default function EventoPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'es'

  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }

      const { data: perfil } = await supabase
        .from('usuario')
        .select('id, org_id, region_id')
        .eq('auth_id', user.id)
        .single()

      if (!perfil) { setError('Error obteniendo perfil.'); return }

      const { data: asignacion } = await supabase
        .from('asignacion')
        .select('vehiculo_id')
        .eq('usuario_id', perfil.id)
        .is('hasta', null)
        .single()

      if (!asignacion) { setError('No tienes vehículo asignado.'); return }

      const { data: evento, error: errEvento } = await supabase
        .from('evento')
        .insert({
          org_id: perfil.org_id,
          region_id: perfil.region_id,
          vehiculo_id: asignacion.vehiculo_id,
          usuario_id: perfil.id,
          tipo,
          descripcion: descripcion || null,
          estado: 'reportado',
        })
        .select('id')
        .single()

      if (errEvento || !evento) {
        setError('Error al reportar el evento. Intenta de nuevo.')
        return
      }

      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notificar-evento`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ evento_id: evento.id }),
      })

      setExito(true)
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Evento reportado</h2>
          <p className="text-sm text-gray-500 mt-2">
            El administrador fue notificado y se creó una novedad en el tablero.
          </p>
          <button
            onClick={() => router.push(`/${locale}/conductor`)}
            className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-gray-900">Reportar evento</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un tipo...</option>
              {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Describe qué pasó, dónde y en qué condiciones..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={enviando || !tipo}
          className="w-full bg-red-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {enviando ? 'Reportando...' : 'Reportar evento'}
        </button>
      </form>
    </div>
  )
}
