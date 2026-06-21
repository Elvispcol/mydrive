import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { obtenerUsuario } from '@/lib/services/usuarios_sistema'
import { listarRegiones } from '@/lib/services/regiones'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { UsuarioForm } from './UsuarioForm'

interface Props {
  usuarioId: string
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function EditarUsuarioPage({ usuarioId, locale, rol, nombre, basePath }: Props) {
  const [usuario, regiones] = await Promise.all([
    obtenerUsuario(usuarioId),
    listarRegiones(),
  ])

  if (!usuario) notFound()

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors mb-6">
            <IconBack /> Usuarios
          </Link>
          <PageHeader
            title={`Editar · ${usuario.nombre}`}
            subtitle={usuario.email}
            actions={<LogoutButton />}
          />
          <UsuarioForm
            regiones={regiones}
            usuario={usuario}
            backHref={basePath}
            successHref={basePath}
          />
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
