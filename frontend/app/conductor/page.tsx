import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ChecklistForm from '@/components/ChecklistForm'
import LogoutButton from '@/components/LogoutButton'

export default async function ConductorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuario')
    .select('id, nombre, rol, org_id, region_id')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'conductor') redirect('/')

  // Asignación vigente del conductor
  const { data: asignacion } = await supabase
    .from('asignacion')
    .select('vehiculo_id, vehiculo(id, placa, marca, linea, modelo_anio)')
    .eq('usuario_id', perfil.id)
    .is('hasta', null)
    .single()

  // Plantilla de checklist activa de la organización
  const { data: plantilla } = await supabase
    .from('checklist_plantilla')
    .select('id, nombre, checklist_item(id, texto, orden, critico)')
    .eq('org_id', perfil.org_id)
    .eq('activa', true)
    .order('orden', { referencedTable: 'checklist_item', ascending: true })
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">MyDrive</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{perfil.nombre}</span>
          <LogoutButton small />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Vehículo asignado */}
        {asignacion?.vehiculo ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 tracking-wide">
                  {(asignacion.vehiculo as any).placa}
                </p>
                <p className="text-sm text-gray-500">
                  {(asignacion.vehiculo as any).marca} {(asignacion.vehiculo as any).linea}
                  {(asignacion.vehiculo as any).modelo_anio ? ` · ${(asignacion.vehiculo as any).modelo_anio}` : ''}
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Asignado a ti
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            No tienes un vehículo asignado. Contacta a tu administrador.
          </div>
        )}

        {/* Links de navegación */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-600 rounded-xl p-4 text-white">
            <p className="font-semibold text-sm">Preoperacional</p>
            <p className="text-xs text-blue-200 mt-0.5">Inspección diaria</p>
          </div>
          <Link href="/conductor/evento"
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700 hover:bg-gray-50 transition-colors">
            <p className="font-semibold text-sm">Reportar evento</p>
            <p className="text-xs text-gray-400 mt-0.5">Choque o incidencia</p>
          </Link>
        </div>

        {/* Checklist */}
        {plantilla && asignacion?.vehiculo ? (
          <ChecklistForm
            plantilla={plantilla as any}
            vehiculoId={(asignacion.vehiculo as any).id}
            usuarioId={perfil.id}
            orgId={perfil.org_id}
            regionId={perfil.region_id!}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            {!plantilla
              ? 'No hay checklist configurado. Contacta a tu administrador.'
              : 'Necesitas un vehículo asignado para hacer el preoperacional.'}
          </div>
        )}
      </div>
    </div>
  )
}
