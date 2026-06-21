import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  obtenerAsignacionVigente,
  obtenerPlantillaActiva,
  preoperacionalDeHoy,
} from '@/lib/services/preoperacional'
import { ChecklistForm } from '@/features/preoperacional/components/ChecklistForm'
import { ConductorNav } from '@/features/conductor/ConductorNav'
import { LogoutButton } from '@/shared/components/LogoutButton'
import type { Locale } from '@/lib/i18n/config'

export default async function ConductorPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol, org_id, region_id')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'conductor') redirect(`/${locale}`)

  const [asignacion, plantilla, preopHoy] = await Promise.all([
    obtenerAsignacionVigente(perfil.id),
    obtenerPlantillaActiva(perfil.org_id),
    preoperacionalDeHoy(perfil.id),
  ])

  const vehiculo = asignacion?.vehiculo as {
    id: string; placa: string; marca: string | null; linea: string | null; modelo_anio: number | null
  } | null

  const hoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-gray-900 text-sm">MyDrive</span>
            <p className="text-xs text-gray-400 capitalize">{hoy}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">{perfil.nombre}</span>
          <LogoutButton small />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Vehículo asignado */}
        {vehiculo ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 tracking-wide">{vehiculo.placa}</p>
                <p className="text-sm text-gray-500">
                  {vehiculo.marca} {vehiculo.linea}
                  {vehiculo.modelo_anio ? ` · ${vehiculo.modelo_anio}` : ''}
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Asignado
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            No tienes un vehículo asignado. Contacta a tu administrador.
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3">
          {preopHoy ? (
            <div className={`rounded-xl p-4 ${
              preopHoy.resultado === 'ok'
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-0.5">
                <svg className={`w-4 h-4 ${preopHoy.resultado === 'ok' ? 'text-green-600' : 'text-amber-600'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className={`font-semibold text-sm ${preopHoy.resultado === 'ok' ? 'text-green-900' : 'text-amber-900'}`}>
                  Preoperacional
                </p>
              </div>
              <p className={`text-xs ${preopHoy.resultado === 'ok' ? 'text-green-600' : 'text-amber-700'}`}>
                {preopHoy.resultado === 'ok' ? 'Completado hoy ✓' : 'Con novedades hoy'}
              </p>
            </div>
          ) : (
            <div className="bg-blue-600 rounded-xl p-4 text-white">
              <p className="font-semibold text-sm">Preoperacional</p>
              <p className="text-xs text-blue-200 mt-0.5">Pendiente hoy</p>
            </div>
          )}

          <Link
            href={`/${locale}/conductor/evento`}
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-sm">Reportar evento</p>
            <p className="text-xs text-gray-400 mt-0.5">Choque o incidencia</p>
          </Link>
        </div>

        {/* Checklist o estado completado */}
        {preopHoy ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              preopHoy.resultado === 'ok' ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              <svg className={`w-6 h-6 ${preopHoy.resultado === 'ok' ? 'text-green-600' : 'text-amber-600'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">
              {preopHoy.resultado === 'ok' ? 'Todo en orden' : 'Preoperacional con novedades'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {preopHoy.resultado === 'ok'
                ? 'No se detectaron fallas. ¡Buen día!'
                : 'Las novedades fueron notificadas a tu administrador.'}
            </p>
            <Link
              href={`/${locale}/conductor/historial`}
              className="inline-block mt-4 text-xs text-blue-600 font-medium hover:text-blue-700"
            >
              Ver historial completo →
            </Link>
          </div>
        ) : plantilla && vehiculo ? (
          <ChecklistForm
            plantilla={plantilla}
            vehiculoId={vehiculo.id}
            usuarioId={perfil.id}
            orgId={perfil.org_id}
            regionId={perfil.region_id!}
            locale={locale}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            {!plantilla
              ? 'No hay checklist configurado. Contacta a tu administrador.'
              : 'Necesitas un vehículo asignado para hacer el preoperacional.'}
          </div>
        )}
      </div>

      <ConductorNav />
    </div>
  )
}
