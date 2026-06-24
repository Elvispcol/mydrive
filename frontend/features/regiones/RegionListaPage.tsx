import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, Region } from '@/lib/supabase/types'
import { listarTodasRegiones } from '@/lib/services/regiones'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function RegionListaPage({ locale, rol, nombre, basePath }: Props) {
  const regiones = await listarTodasRegiones()
  const activas = regiones.filter(r => r.activo).length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto">
          <PageHeader
            title="Regiones"
            subtitle={`${regiones.length} total · ${activas} activa${activas !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href={`${basePath}/nueva`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                >
                  <IconPlus /> Nueva región
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {regiones.length === 0 ? (
            <EmptyState label="Sin regiones registradas" />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-surface-raised border-b border-border">
                {['Región', 'Estado', ''].map(h => (
                  <span key={h} className="text-[11px] font-medium text-ink-500">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {regiones.map(r => (
                  <RegionRow key={r.id} r={r} basePath={basePath} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function RegionRow({ r, basePath }: { r: Region; basePath: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 items-center hover:bg-surface-raised transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900">{r.nombre}</p>
        <p className="text-xs text-ink-400 mt-0.5">
          Creada {new Date(r.creado_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <Badge variant={r.activo ? 'success' : 'muted'}>{r.activo ? 'Activa' : 'Inactiva'}</Badge>
      <Link
        href={`${basePath}/${r.id}/editar`}
        className="text-xs text-primary hover:text-primary-hover font-medium transition-colors shrink-0"
      >
        Editar
      </Link>
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
