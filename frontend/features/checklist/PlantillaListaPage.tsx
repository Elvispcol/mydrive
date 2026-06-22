import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarPlantillas, type PlantillaConItems } from '@/lib/services/checklist'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'

interface Props { locale: Locale; rol: Rol; nombre: string; basePath: string }

export async function PlantillaListaPage({ locale, rol, nombre, basePath }: Props) {
  const plantillas = await listarPlantillas()
  const activas = plantillas.filter(p => p.activa).length

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <PageHeader
            title="Plantillas de Preoperacional"
            subtitle={`${plantillas.length} plantilla${plantillas.length !== 1 ? 's' : ''} · ${activas} activa${activas !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-3">
                <Link href={`${basePath}/nuevo`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20">
                  <IconPlus /> Nueva plantilla
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {plantillas.length === 0 ? (
            <EmptyState label="Sin plantillas. Crea la primera para que los conductores puedan realizar inspecciones." />
          ) : (
            <div className="space-y-3 mt-6">
              {plantillas.map(p => <PlantillaCard key={p.id} p={p} basePath={basePath} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PlantillaCard({ p, basePath }: { p: PlantillaConItems; basePath: string }) {
  const criticos = p.items.filter(it => it.critico).length

  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-primary-pale/50 flex items-center justify-center shrink-0">
          <IconClipboard />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-ink-900 truncate">{p.nombre}</p>
            <Badge variant={p.activa ? 'success' : 'muted'}>{p.activa ? 'Activa' : 'Inactiva'}</Badge>
          </div>
          <p className="text-xs text-ink-400">
            {p.items.length} ítem{p.items.length !== 1 ? 's' : ''}
            {criticos > 0 && ` · ${criticos} crítico${criticos !== 1 ? 's' : ''}`}
          </p>
          {p.items.length > 0 && (
            <p className="text-xs text-ink-300 mt-1 truncate max-w-sm">
              {p.items.slice(0, 3).map(it => it.texto).join(', ')}
              {p.items.length > 3 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
      <Link href={`${basePath}/${p.id}/editar`} className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover border border-primary/30 bg-primary-pale/30 hover:bg-primary-pale px-3 py-1.5 rounded-lg transition-colors">
        Editar
      </Link>
    </div>
  )
}

function IconPlus() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg> }
function IconClipboard() { return <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> }
