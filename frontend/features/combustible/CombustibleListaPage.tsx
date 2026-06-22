import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, TipoCombustible } from '@/lib/supabase/types'
import { listarCombustible, type CombustibleConDetalle } from '@/lib/services/combustible'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { KpiCard } from '@/shared/components/ui/KpiCard'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const TIPO_LABELS: Record<TipoCombustible, string> = {
  gasolina:    'Gasolina',
  diesel:      'Diésel',
  gas_natural: 'Gas natural',
  electrico:   'Eléctrico',
  hibrido:     'Híbrido',
}

const TIPO_VARIANT: Record<TipoCombustible, 'primary' | 'success' | 'warning' | 'muted'> = {
  gasolina:    'primary',
  diesel:      'warning',
  gas_natural: 'success',
  electrico:   'success',
  hibrido:     'muted',
}

interface Props {
  locale: Locale
  rol: Rol
  nombre: string
  basePath: string
}

export async function CombustibleListaPage({ locale, rol, nombre, basePath }: Props) {
  const registros = await listarCombustible(100)

  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  const delMes = registros.filter(r => r.fecha >= inicioMes)

  const totalLitrosMes = delMes.reduce((s, r) => s + (r.litros ?? 0), 0)
  const totalCostoMes  = delMes.reduce((s, r) => s + (r.costo_total ?? 0), 0)

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <PageHeader
            title="Combustible"
            subtitle={`${registros.length} registro${registros.length !== 1 ? 's' : ''} · ${delMes.length} este mes`}
            actions={
              <div className="flex items-center gap-3">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                >
                  <IconPlus /> Registrar carga
                </Link>
                <LogoutButton />
              </div>
            }
          />

          {/* KPIs del mes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
            <KpiCard
              label="Registros este mes"
              value={delMes.length}
              variant="primary"
              icon={<IconFuel />}
            />
            <KpiCard
              label="Litros este mes"
              value={`${totalLitrosMes.toLocaleString('es-CO', { maximumFractionDigits: 1 })} L`}
              variant="primary"
              icon={<IconDroplet />}
            />
            <KpiCard
              label="Costo este mes"
              value={totalCostoMes > 0 ? `$${totalCostoMes.toLocaleString('es-CO', { maximumFractionDigits: 0 })}` : '—'}
              variant={totalCostoMes > 0 ? 'warning' : 'primary'}
              icon={<IconMoney />}
            />
          </div>

          {registros.length === 0 ? (
            <EmptyState label="Sin registros de combustible. Comienza registrando la primera carga." />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_1.5fr_1.2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2.5 bg-surface-raised border-b border-border">
                {['Fecha', 'Vehículo', 'Conductor', 'Tipo', 'Litros', 'Costo total', ''].map(h => (
                  <span key={h} className="text-xs font-semibold text-ink-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border">
                {registros.map(r => (
                  <CombustibleRow key={r.id} r={r} basePath={basePath} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function CombustibleRow({
  r,
  basePath,
  locale,
}: {
  r: CombustibleConDetalle
  basePath: string
  locale: Locale
}) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr_1.2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3.5 items-center hover:bg-surface-raised transition-colors">
      <span className="text-sm text-ink-700">{formatDate(r.fecha, locale)}</span>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">
          {r.vehiculo?.placa ?? '—'}
        </p>
        {r.vehiculo?.marca && (
          <p className="text-xs text-ink-400 truncate">{r.vehiculo.marca}</p>
        )}
      </div>

      <span className="text-sm text-ink-500 truncate">
        {r.conductor?.nombre ?? <span className="text-ink-300 italic">—</span>}
      </span>

      <Badge variant={TIPO_VARIANT[r.tipo_combustible]}>
        {TIPO_LABELS[r.tipo_combustible]}
      </Badge>

      <span className="text-sm text-ink-700">
        {r.litros != null ? `${Number(r.litros).toLocaleString('es-CO', { maximumFractionDigits: 2 })} L` : '—'}
      </span>

      <span className="text-sm font-medium text-ink-800">
        {r.costo_total != null
          ? `$${Number(r.costo_total).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
          : '—'}
      </span>

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
function IconFuel() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h10v16H3V4zM13 8h2a2 2 0 012 2v2a2 2 0 002 2v4M7 8v2" />
    </svg>
  )
}
function IconDroplet() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 7 4 10.5 4 14a8 8 0 0016 0c0-3.5-2.48-7-8-12z" />
    </svg>
  )
}
function IconMoney() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
