import type { ReactNode } from 'react'

type KpiVariant = 'danger' | 'warning' | 'success' | 'primary'

const STYLES: Record<KpiVariant, { icon: string; value: string }> = {
  danger:  { icon: 'bg-danger-pale text-danger-dark',   value: 'text-danger-dark' },
  warning: { icon: 'bg-warning-pale text-warning-dark', value: 'text-warning-dark' },
  success: { icon: 'bg-success-pale text-success-dark', value: 'text-ink-900' },
  primary: { icon: 'bg-primary-pale text-primary',      value: 'text-ink-900' },
}

export function KpiCard({
  label,
  value,
  variant,
  icon,
}: {
  label: string
  value: string | number
  variant: KpiVariant
  icon: ReactNode
}) {
  const s = STYLES[variant]
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${s.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${s.value}`}>{value}</p>
      <p className="text-xs text-ink-500 mt-1 leading-snug">{label}</p>
    </div>
  )
}
