import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { obtenerPreoperacionalCompleto } from '@/lib/services/preoperacional'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'

interface Props {
  preoperacionalId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function PreoperacionalDetallePage({ preoperacionalId, locale, rol, nombre, basePath }: Props) {
  const preop = await obtenerPreoperacionalCompleto(preoperacionalId)
  if (!preop) notFound()

  const fecha = new Date(preop.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  const fallas = preop.respuestas.filter(r => !r.aprobado)
  const aprobados = preop.respuestas.filter(r => r.aprobado)

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6"
          >
            <IconBack /> Preoperacionales
          </Link>

          <PageHeader
            title={`Preoperacional — ${preop.conductor?.nombre ?? 'Conductor'}`}
            subtitle={fecha}
            badge={preop.resultado === 'ok' ? 'Sin fallas' : 'Con novedades'}
            actions={<LogoutButton />}
          />

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <InfoCard label="Conductor" value={preop.conductor?.nombre ?? '—'} />
            <InfoCard label="Vehículo" value={preop.vehiculo?.placa ?? '—'} mono />
            <div className="bg-surface rounded-xl border border-border px-4 py-3">
              <p className="text-xs text-ink-400 mb-1">Resultado</p>
              <Badge variant={preop.resultado === 'ok' ? 'success' : 'warning'}>
                {preop.resultado === 'ok' ? 'Sin fallas' : 'Con novedades'}
              </Badge>
            </div>
          </div>

          {preop.respuestas.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-6 text-center text-ink-400 text-sm">
              Sin respuestas registradas
            </div>
          ) : (
            <div className="space-y-4">
              {/* Fallas primero */}
              {fallas.length > 0 && (
                <div className="bg-surface rounded-xl border border-danger/30 overflow-hidden">
                  <div className="px-4 py-2.5 bg-danger/5 border-b border-danger/20">
                    <p className="text-xs font-semibold text-danger">
                      Fallas detectadas ({fallas.length})
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {fallas.sort((a, b) => (a.item?.orden ?? 0) - (b.item?.orden ?? 0)).map(r => (
                      <div key={r.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded bg-danger/10 text-danger flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✗</span>
                          <div className="flex-1">
                            <p className="text-sm text-ink-900">
                              {r.item?.texto ?? '—'}
                              {r.item?.critico && (
                                <span className="ml-2 text-xs bg-danger/10 text-danger px-1.5 py-0.5 rounded font-medium">crítico</span>
                              )}
                            </p>
                            {r.nota && (
                              <p className="text-xs text-ink-400 mt-1 italic">"{r.nota}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items aprobados */}
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-surface-raised">
                  <p className="text-[11px] font-medium text-ink-500">
                    Ítems aprobados ({aprobados.length})
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {aprobados.sort((a, b) => (a.item?.orden ?? 0) - (b.item?.orden ?? 0)).map(r => (
                    <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="w-5 h-5 rounded bg-success/10 text-success flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                      <p className="text-sm text-ink-700">{r.item?.texto ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-surface rounded-xl border border-border px-4 py-3">
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold text-ink-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function IconBack() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
