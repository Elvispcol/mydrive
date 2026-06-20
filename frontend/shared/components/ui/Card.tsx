import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  borderLeft,
}: {
  children: ReactNode
  className?: string
  borderLeft?: 'danger' | 'warning' | 'primary' | 'success'
}) {
  const borderMap = {
    danger:  'border-l-4 border-l-danger',
    warning: 'border-l-4 border-l-warning',
    primary: 'border-l-4 border-l-primary',
    success: 'border-l-4 border-l-success',
  }

  return (
    <div className={`bg-surface rounded-xl border border-border ${borderLeft ? borderMap[borderLeft] : ''} ${className}`}>
      {children}
    </div>
  )
}
