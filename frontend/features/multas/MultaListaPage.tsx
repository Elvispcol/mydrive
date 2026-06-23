import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Rol, TipoInfraccion, EstadoMulta } from '@/lib/supabase/types'
import { listarMultas, type MultaConDetalle } from '@/lib/services/multas'
import { Sidebar } from '@/shared/components/Sidebar'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { PageHeader } from '@/shared/components/PageHeader'
import { KpiCard } from '@/shared/components/ui/KpiCard'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const TIPO_LABELS: Record<TipoInfraccion, string> = {
  velocidad:       'Velocidad',
  senales:         'Señales',
  estacionamiento: 'Estacionamiento',
  documentos:      'Documentos',
  alcoholemia:     'Alcoholemia',
  otro:            'Otro',
}

const ESTADO_VARIANT: Record<EstadoMulta, 'danger' | 'warning' | 'success' | 'muted'> = {
  pendiente:  'danger',
  en_disputa: 'warning',
  pagada:     'success',
  exonerada:  'muted',
  vencida:    'danger',
}

const ESTADO_LABELS: Record<EstadoMulta, string> = {
  pendiente:  'Pendiente',
  en_disputa: 'En disputa',
  pagada:     'Pagada',
  exonerada:  'Exonerada',
  vencida:    'Vencida',
}

interface Props { locale: Locale; rol: Rol; nombre: string; basePath: string }

export async function MultaListaPage({ locale, rol, nombre, basePath }: Props) {
  const multas = await listarMultas()

  const pendientes = multas.filter(m => m.estado === 'pendiente' || m.estado === 'en_disputa')
  const valorTotal = pendientes.reduce((s, m) => s + (m.valor ?? 0), 0)
  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  const delMes = multas.filter(m => m.fecha_infraccion >= inicioMes)

  return (
    <div className="flex h-full">
      <Sidebar rol={rol} nombre={nombre} />
      <main className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-6">
          <PageHeader
            title="Multas e Infracciones"
            badge="Flota"
            subtitle={`${multas.length} total · ${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''}`}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href={`${basePath}/nuevo`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <IconPlus /> Registrar infracción
                </Link>
                <LogoutButton />
              </div>
            }
          />

          <div className="grid grid-cols-3 gap-3 mb-5">
            <KpiCard label="Pendientes de pago"    value={pendientes.length}  variant={pendientes.length > 0 ? 'danger' : 'success'} icon={<IconAlert />} />
            <KpiCard label="Valor total pendiente"  value={valorTotal > 0 ? `$${valorTotal.toLocaleString('es-CO', { maximumFractionDigits: 0 })}` : '—'} variant={valorTotal > 0 ? 'warning' : 'primary'} icon={<IconMoney />} />
            <KpiCard label="Infracciones este mes"  value={delMes.length}      variant="primary" icon={<IconCalendar />} />
          </div>

          {multas.length === 0 ? (
            <EmptyState label="Sin infracciones registradas." />
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-28">Fecha</th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">Vehículo</th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Conductor</th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">Tipo</th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-28">Valor</th>
                    <th className="h-12 px-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-28">Estado</th>
                    <th className="h-12 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {multas.map(m => (
                    <MultaRow key={m.id} m={m} basePath={basePath} locale={locale} />
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

function MultaRow({ m, basePath, locale }: { m: MultaConDetalle; basePath: string; locale: Locale }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-table-row-hover transition-colors group">
      <td className="h-9 px-4 text-xs text-ink-500">{formatDate(m.fecha_infraccion, locale)}</td>
      <td className="h-9 px-4">
        <p className="font-mono text-xs font-semibold text-ink-900 leading-none">{m.vehiculo?.placa ?? '—'}</p>
        {m.vehiculo?.marca && <p className="text-[10px] text-ink-300 mt-0.5 leading-none">{m.vehiculo.marca}</p>}
      </td>
      <td className="h-9 px-4 text-xs text-ink-500 truncate max-w-[180px]">
        {m.conductor?.nombre ?? <span className="text-ink-300 italic">—</span>}
      </td>
      <td className="h-9 px-4 text-xs text-ink-700">{TIPO_LABELS[m.tipo]}</td>
      <td className="h-9 px-4 text-xs font-medium text-ink-800">
        {m.valor != null ? `$${Number(m.valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}` : '—'}
      </td>
      <td className="h-9 px-4">
        <Badge variant={ESTADO_VARIANT[m.estado]}>{ESTADO_LABELS[m.estado]}</Badge>
      </td>
      <td className="h-9 px-4">
        <Link
          href={`${basePath}/${m.id}/editar`}
          className="text-[11px] text-primary hover:text-primary-hover font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Editar
        </Link>
      </td>
    </tr>
  )
}

function IconPlus()    { return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg> }
function IconAlert()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> }
function IconMoney()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function IconCalendar(){ return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> }
