import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarVehiculos } from '@/lib/services/vehiculos'
import { listarRegiones } from '@/lib/services/regiones'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { NovedadForm } from './NovedadForm'

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function NuevaNovedadPage({ locale, rol, nombre, basePath }: Props) {
  const [{ items: vehiculos }, regiones] = await Promise.all([
    listarVehiculos({ limit: 200 }),
    listarRegiones(),
  ])

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6">
            <IconBack /> Novedades
          </Link>
          <PageHeader title="Nueva novedad" subtitle="Registra un problema o incidente" actions={<LogoutButton />} />
          <NovedadForm vehiculos={vehiculos} regiones={regiones} backHref={basePath} successHref={basePath} />
        </div>
      </main>
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
