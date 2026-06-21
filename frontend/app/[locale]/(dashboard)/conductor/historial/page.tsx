import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listarMisPreoperacionales } from '@/lib/services/preoperacional'
import { ConductorNav } from '@/features/conductor/ConductorNav'
import { LogoutButton } from '@/shared/components/LogoutButton'
import type { Locale } from '@/lib/i18n/config'

export default async function HistorialPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'conductor') redirect(`/${locale}`)

  const preoperacionales = await listarMisPreoperacionales(perfil.id, 30)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Historial</span>
        </div>
        <LogoutButton small />
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {preoperacionales.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No has registrado preoperacionales aún.
          </div>
        ) : (
          <div className="space-y-2.5">
            {preoperacionales.map(p => {
              const fecha = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
                weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
              })
              const ok = p.resultado === 'ok'
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    ok ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {ok ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{fecha}</p>
                    {p.vehiculo && (
                      <p className="text-xs text-gray-400 truncate">
                        {p.vehiculo.placa}
                        {p.vehiculo.marca ? ` · ${p.vehiculo.marca}` : ''}
                        {p.vehiculo.linea ? ` ${p.vehiculo.linea}` : ''}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    ok
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {ok ? 'Sin fallas' : 'Con novedades'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConductorNav />
    </div>
  )
}
