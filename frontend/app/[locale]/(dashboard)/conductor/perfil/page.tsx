import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConductorNav } from '@/features/conductor/ConductorNav'
import { LogoutButton } from '@/shared/components/LogoutButton'
import type { Locale } from '@/lib/i18n/config'

export default async function PerfilPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, email, rol, telefono, celular, ciudad, cargo, tipo_licencia, licencia_vencimiento, region_id, creado_en')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'conductor') redirect(`/${locale}`)

  const { data: region } = await supabase
    .from('region')
    .select('nombre')
    .eq('id', perfil.region_id)
    .single()

  const hoy = new Date()
  const venceLic = perfil.licencia_vencimiento ? new Date(perfil.licencia_vencimiento) : null
  const diasLicencia = venceLic ? Math.ceil((venceLic.getTime() - hoy.getTime()) / 86400000) : null
  const licenciaVencida = diasLicencia !== null && diasLicencia < 0
  const licenciaProxima = diasLicencia !== null && diasLicencia >= 0 && diasLicencia <= 30

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Mi perfil</span>
        </div>
        <LogoutButton small />
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Avatar + nombre */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-white">{perfil.nombre.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{perfil.nombre}</p>
            <p className="text-sm text-gray-500">{perfil.email}</p>
            {region && <p className="text-xs text-gray-400 mt-0.5">{region.nombre}</p>}
          </div>
        </div>

        {/* Licencia */}
        <div className={`rounded-xl border p-4 ${
          licenciaVencida
            ? 'bg-red-50 border-red-200'
            : licenciaProxima
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-gray-200'
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
            licenciaVencida ? 'text-red-500' : licenciaProxima ? 'text-amber-600' : 'text-gray-400'
          }`}>
            Licencia de conducción
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {perfil.tipo_licencia ?? 'Sin tipo registrado'}
              </p>
              {venceLic ? (
                <p className={`text-xs mt-0.5 ${
                  licenciaVencida ? 'text-red-600 font-semibold' : licenciaProxima ? 'text-amber-700' : 'text-gray-400'
                }`}>
                  Vence: {venceLic.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  {licenciaVencida && ' · VENCIDA'}
                  {licenciaProxima && ` · ${diasLicencia} día${diasLicencia === 1 ? '' : 's'}`}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">Sin fecha de vencimiento</p>
              )}
            </div>
            {(licenciaVencida || licenciaProxima) && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                licenciaVencida ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {licenciaVencida ? 'Vencida' : 'Por vencer'}
              </span>
            )}
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contacto</p>
          <div className="space-y-2.5">
            <InfoFila label="Teléfono" value={perfil.telefono} />
            <InfoFila label="Celular" value={perfil.celular} />
            <InfoFila label="Ciudad" value={perfil.ciudad} />
            <InfoFila label="Cargo" value={perfil.cargo} />
          </div>
        </div>

        <p className="text-center text-xs text-gray-300">
          Para actualizar tus datos contacta a tu administrador.
        </p>
      </div>

      <ConductorNav />
    </div>
  )
}

function InfoFila({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? '—'}</span>
    </div>
  )
}
