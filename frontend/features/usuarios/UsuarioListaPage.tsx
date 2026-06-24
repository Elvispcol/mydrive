import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarUsuariosSistema } from '@/lib/services/usuarios_sistema'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'

const ROL_LABEL: Record<string, string> = {
  director:    'Director',
  admin_apoyo: 'Admin / Apoyo',
  conductor:   'Conductor',
}

const ROL_VARIANT: Record<string, 'primary' | 'warning' | 'muted'> = {
  director:    'primary',
  admin_apoyo: 'warning',
  conductor:   'muted',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function UsuarioListaPage({ locale, rol, nombre, basePath }: Props) {
  const usuarios = await listarUsuariosSistema()

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <PageHeader
            title="Usuarios del sistema"
            subtitle={`${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrado${usuarios.length !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                >
                  <IconPlus /> Nuevo usuario
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {usuarios.length === 0 ? (
            <EmptyState label="No hay usuarios del sistema registrados" />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 bg-surface-raised border-b border-border">
                {['Usuario', 'Rol', 'Región', 'Ciudad', ''].map(h => (
                  <span key={h} className="text-[11px] font-medium text-ink-500">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {usuarios.map(u => (
                  <div key={u.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-surface-raised transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{u.nombre}</p>
                      <p className="text-xs text-ink-400 truncate">{u.email}</p>
                    </div>
                    <Badge variant={ROL_VARIANT[u.rol] ?? 'muted'}>{ROL_LABEL[u.rol] ?? u.rol}</Badge>
                    <span className="text-sm text-ink-500 truncate">{u.region?.nombre ?? '—'}</span>
                    <span className="text-sm text-ink-500 truncate">{u.ciudad ?? '—'}</span>
                    <Link
                      href={`${basePath}/${u.id}/editar`}
                      className="text-xs text-primary hover:text-primary-hover font-medium transition-colors shrink-0"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
