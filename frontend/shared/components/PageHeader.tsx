import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string
  subtitle?: string
  badge?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        {badge && (
          <span className="text-xs font-semibold text-primary bg-primary-pale px-2.5 py-1 rounded-full inline-block mb-3">
            {badge}
          </span>
        )}
        <h1 className="text-xl font-bold text-ink-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
