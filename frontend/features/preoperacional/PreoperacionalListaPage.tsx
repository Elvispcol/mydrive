import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol } from '@/lib/supabase/types'
import { listarPreoperacionalesConDetalle } from '@/lib/services/preoperacional'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function PreoperacionalListaPage({ locale, rol, nombre, basePath }: Props) {
  const hoy = new Date().toISOString().split('T')[0]
  const preoperacionales = await listarPreoperacionalesConDetalle({ fecha: hoy, limit: 100 })

  const fechaDisplay = new Date(hoy + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  const totalOk = preoperacionales.filter(p => p.resultado === 'ok').length
  const totalFallas = preoperacionales.length - totalOk

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <PageHeader
            title="Preoperacionales"
            subtitle={fechaDisplay}
            badge={`${preoperacionales.length} hoy`}
            actions={<LogoutButton />}
          />

          {preoperacionales.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface rounded-xl border border-border px-4 py-3">
                <p className="text-2xl font-bold text-ink-900">{preoperacionales.length}</p>
                <p className="text-xs text-ink-400 mt-0.5">Total registrados hoy</p>
              </div>
              <div className="bg-surface rounded-xl border border-border px-4 py-3">
                <p className="text-2xl font-bold text-success">{totalOk}</p>
                <p className="text-xs text-ink-400 mt-0.5">Sin fallas</p>
              </div>
              <div className="bg-surface rounded-xl border border-border px-4 py-3">
                <p className="text-2xl font-bold text-warning">{totalFallas}</p>
                <p className="text-xs text-ink-400 mt-0.5">Con novedades</p>
              </div>
            </div>
          )}

          {preoperacionales.length === 0 ? (
            <EmptyState label="Sin preoperacionales registrados hoy" />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-border bg-surface-raised">
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Conductor</span>
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Vehículo</span>
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Resultado</span>
                <span />
              </div>
              <div className="divide-y divide-border">
                {preoperacionales.map(p => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 hover:bg-surface-raised transition-colors"
                  >
                    <p className="text-sm font-medium text-ink-900">{p.conductor?.nombre ?? '—'}</p>
                    <p className="text-sm text-ink-500 font-mono">{p.vehiculo?.placa ?? '—'}</p>
                    <Badge variant={p.resultado === 'ok' ? 'success' : 'warning'}>
                      {p.resultado === 'ok' ? 'Sin fallas' : 'Con novedades'}
                    </Badge>
                    <Link
                      href={`${basePath}/${p.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Ver →
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
