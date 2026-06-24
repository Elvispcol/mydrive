import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import type { ConductorConVehiculo } from '@/lib/services/conductores'
import type { Locale } from '@/lib/i18n/config'

const TIPO_ASIGNACION_LABEL: Record<string, string> = {
  beneficio:           'Beneficio personal',
  herramienta_trabajo: 'Herramienta de trabajo',
  seguridad:           'Seguridad / Escolta',
  representacion:      'Representación',
  otro:                'Otro',
}

interface Props {
  conductor: ConductorConVehiculo | null
  locale: Locale
  backHref: string
  actions?: ReactNode
}

export function ConductorDetallePage({ conductor: c, locale, backHref, actions }: Props) {
  if (!c) notFound()

  const dias = c.dias_para_vencer_licencia
  const licenciaVariant = dias === null ? 'muted' : dias < 0 ? 'danger' : dias <= 7 ? 'danger' : dias <= 30 ? 'warning' : 'success'
  const licenciaLabel = dias === null ? 'Sin datos' : dias < 0 ? `Vencida hace ${Math.abs(dias)} días` : dias === 0 ? 'Vence hoy' : `Vence en ${dias} días`

  return (
    <>
      <PageHeader
        title={c.nombre}
        subtitle={`${c.cargo ?? 'Conductor'} · ${c.region?.nombre ?? '—'}`}
        actions={
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
            >
              ← Volver
            </Link>
            {actions}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Datos personales ── */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Datos personales">
            <Grid2>
              <Field label="Nombre completo"    value={c.nombre} />
              <Field label="Cédula / Documento" value={c.documento} />
              <Field label="Cargo"              value={c.cargo} />
              <Field label="Regional"           value={c.region?.nombre} />
              <Field label="Ciudad"             value={c.ciudad} />
              <Field label="Celular"            value={c.celular} />
              <Field label="Correo electrónico" value={c.email} />
            </Grid2>
          </Section>

          <Section title="Licencia de conducción">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <Grid2>
                  <Field label="Categoría"       value={c.tipo_licencia} />
                  <div>
                    <dt className="text-xs text-ink-400 mb-0.5">Estado</dt>
                    <dd><Badge variant={licenciaVariant}>{licenciaLabel}</Badge></dd>
                  </div>
                  <Field label="Fecha expedición"  value={formatDate(c.licencia_expedicion)} />
                  <Field label="Fecha vencimiento" value={formatDate(c.licencia_vencimiento)} />
                </Grid2>
              </div>
            </div>
          </Section>
        </div>

        {/* ── Vehículo asignado ── */}
        <div className="space-y-6">
          <Section title="Vehículo asignado">
            {c.asignacion_activa ? (
              <div className="space-y-3">
                <Link
                  href={`/${locale}/admin/vehiculos/${c.asignacion_activa.vehiculo.id}`}
                  className="block"
                >
                  <p className="font-mono text-2xl font-bold text-ink-900 tracking-wider mb-1">
                    {c.asignacion_activa.vehiculo.placa}
                  </p>
                  <p className="text-sm text-ink-500">
                    {c.asignacion_activa.vehiculo.marca} {c.asignacion_activa.vehiculo.linea}
                    {c.asignacion_activa.vehiculo.modelo_anio ? ` · ${c.asignacion_activa.vehiculo.modelo_anio}` : ''}
                  </p>
                </Link>
                <dl className="space-y-2 mt-3">
                  <Field
                    label="Tipo de asignación"
                    value={c.asignacion_activa.tipo_asignacion
                      ? TIPO_ASIGNACION_LABEL[c.asignacion_activa.tipo_asignacion]
                      : '—'}
                  />
                  <Field label="Desde" value={formatDate(c.asignacion_activa.desde)} />
                </dl>
              </div>
            ) : (
              <p className="text-sm text-ink-300 italic">Sin vehículo asignado</p>
            )}
          </Section>
        </div>

      </div>
    </>
  )
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-[11px] font-medium text-ink-500 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Grid2({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-ink-400 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">{value ?? '—'}</dd>
    </div>
  )
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
