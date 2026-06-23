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
    <div className="flex items-center justify-between mb-6 gap-4 pb-4 border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          {subtitle && (
            <p className="text-xs text-ink-300 mb-0.5 flex items-center gap-1.5">
              {badge && <span className="text-primary-hover font-medium">{badge}</span>}
              {badge && subtitle && <span>/</span>}
              <span>{subtitle}</span>
            </p>
          )}
          <h1 className="text-base font-semibold text-ink-900 tracking-tight truncate">{title}</h1>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
