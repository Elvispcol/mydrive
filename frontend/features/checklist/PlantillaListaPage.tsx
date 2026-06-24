import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarPlantillas, type PlantillaConItems } from '@/lib/services/checklist'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { StatusDot } from '@/shared/components/ui/Badge'

interface Props { locale: Locale; rol: Rol; nombre: string; basePath: string }

export async function PlantillaListaPage({ locale, rol, nombre, basePath }: Props) {
  const plantillas = await listarPlantillas()
  const activas = plantillas.filter(p => p.activa).length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-6">
          <PageHeader
            title="Plantillas de Preoperacional"
            subtitle={`${plantillas.length} plantilla${plantillas.length !== 1 ? 's' : ''} · ${activas} activa${activas !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-2">
                <Link href={`${basePath}/nuevo`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
                  <IconPlus /> Nueva plantilla
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {plantillas.length === 0 ? (
            <EmptyState label="Sin plantillas. Crea la primera para que los conductores puedan realizar inspecciones." />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="h-9 px-4 text-left">Nombre</th>
                    <th className="h-9 px-4 text-left w-16">Ítems</th>
                    <th className="h-9 px-4 text-left w-20">Críticos</th>
                    <th className="h-9 px-4 text-left w-24">Estado</th>
                    <th className="h-9 w-14" />
                  </tr>
                </thead>
                <tbody>
                  {plantillas.map(p => (
                    <PlantillaRow key={p.id} p={p} basePath={basePath} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PlantillaRow({ p, basePath }: { p: PlantillaConItems; basePath: string }) {
  const criticos = p.items.filter(it => it.critico).length

  return (
    <tr className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group">
      <td className="h-9 px-4">
        <p className="text-xs font-medium text-ink-900 truncate">{p.nombre}</p>
      </td>
      <td className="h-9 px-4 text-xs text-ink-500">{p.items.length}</td>
      <td className="h-9 px-4 text-xs text-ink-500">
        {criticos > 0 ? (
          <span className="text-danger-dark font-medium">{criticos}</span>
        ) : (
          <span className="text-ink-300">—</span>
        )}
      </td>
      <td className="h-9 px-4">
        <StatusDot variant={p.activa ? 'success' : 'muted'}>
          {p.activa ? 'Activa' : 'Inactiva'}
        </StatusDot>
      </td>
      <td className="h-9 px-2">
        <Link
          href={`${basePath}/${p.id}/editar`}
          className="text-[11px] text-primary hover:text-primary-hover font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Editar
        </Link>
      </td>
    </tr>
  )
}

function IconPlus() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
