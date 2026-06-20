'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ChecklistItem, ChecklistPlantilla } from '@/lib/supabase/types'
import type { Locale } from '@/lib/i18n/config'
import { defaultLocale } from '@/lib/i18n/config'

type Plantilla = ChecklistPlantilla & { checklist_item: ChecklistItem[] }
type Respuesta = { aprobado: boolean | null; nota: string }

export function ChecklistForm({
  plantilla,
  vehiculoId,
  usuarioId,
  orgId,
  regionId,
  locale = defaultLocale,
}: {
  plantilla: Plantilla
  vehiculoId: string
  usuarioId: string
  orgId: string
  regionId: string
  locale?: Locale
}) {
  const router = useRouter()
  const items = [...plantilla.checklist_item].sort((a, b) => a.orden - b.orden)

  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>(
    Object.fromEntries(items.map(i => [i.id, { aprobado: null, nota: '' }])),
  )
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState<{ novedades: number } | null>(null)
  const [error, setError] = useState('')

  const todoRespondido = items.every(i => respuestas[i.id]?.aprobado !== null)
  const fallasCount = items.filter(i => respuestas[i.id]?.aprobado === false).length
  const sinResponder = items.filter(i => respuestas[i.id]?.aprobado === null).length

  function setAprobado(itemId: string, valor: boolean) {
    setRespuestas(prev => ({ ...prev, [itemId]: { ...prev[itemId], aprobado: valor } }))
  }

  function setNota(itemId: string, nota: string) {
    setRespuestas(prev => ({ ...prev, [itemId]: { ...prev[itemId], nota } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!todoRespondido) return
    setEnviando(true)
    setError('')

    try {
      const supabase = createClient()

      const { data: preop, error: errPreop } = await supabase
        .from('preoperacional')
        .insert({
          org_id: orgId,
          region_id: regionId,
          vehiculo_id: vehiculoId,
          usuario_id: usuarioId,
          plantilla_id: plantilla.id,
          resultado: 'ok',
        })
        .select('id')
        .single()

      if (errPreop || !preop) {
        setError('Error al guardar. Intenta de nuevo.')
        return
      }

      const { error: errResp } = await supabase
        .from('preoperacional_respuesta')
        .insert(
          items.map(i => ({
            preoperacional_id: preop.id,
            item_id: i.id,
            aprobado: respuestas[i.id].aprobado!,
            nota: respuestas[i.id].nota || null,
          })),
        )

      if (errResp) {
        setError('Error guardando respuestas. Intenta de nuevo.')
        return
      }

      let novedadesCreadas = 0
      if (fallasCount > 0) {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/crear-novedad`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ preoperacional_id: preop.id }),
          },
        )
        if (resp.ok) {
          const data = await resp.json()
          novedadesCreadas = data.novedades?.length ?? 0
        }
      }

      setExito({ novedades: novedadesCreadas })
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Preoperacional enviado</h3>
        {exito.novedades > 0 ? (
          <p className="text-sm text-gray-500 mt-2">
            Se generaron <strong>{exito.novedades} novedad{exito.novedades > 1 ? 'es' : ''}</strong> por fallas críticas.
            Tu administrador fue notificado.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-2">Todo en orden. Sin fallas críticas.</p>
        )}
        <button
          onClick={() => router.refresh()}
          className="mt-5 text-sm text-blue-600 font-medium hover:text-blue-700"
        >
          Hacer otro preoperacional
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">{plantilla.nombre}</p>
          <p className="text-xs text-gray-400">
            {items.length} ítems · {items.filter(i => i.critico).length} críticos
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map(item => {
            const resp = respuestas[item.id]
            const fallo = resp.aprobado === false
            return (
              <div key={item.id} className={`px-4 py-3 ${fallo ? 'bg-red-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAprobado(item.id, true)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        resp.aprobado === true
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-green-100'
                      }`}
                    >✓</button>
                    <button
                      type="button"
                      onClick={() => setAprobado(item.id, false)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        resp.aprobado === false
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100'
                      }`}
                    >✗</button>
                  </div>
                  <span className="text-sm text-gray-800 flex-1">{item.texto}</span>
                  {item.critico && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                      crítico
                    </span>
                  )}
                </div>

                {fallo && (
                  <input
                    type="text"
                    placeholder="Nota sobre la falla (opcional)"
                    value={resp.nota}
                    onChange={e => setNota(item.id, e.target.value)}
                    maxLength={500}
                    className="mt-2 w-full px-3 py-1.5 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {fallasCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          ⚠️ {fallasCount} falla{fallasCount > 1 ? 's' : ''} detectada{fallasCount > 1 ? 's' : ''}.
          Se generará{fallasCount > 1 ? 'n' : ''} novedad{fallasCount > 1 ? 'es' : ''} automáticamente.
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={!todoRespondido || enviando}
        className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {enviando
          ? 'Enviando...'
          : `Enviar preoperacional${sinResponder > 0 ? ` (${sinResponder} sin responder)` : ''}`}
      </button>
    </form>
  )
}
