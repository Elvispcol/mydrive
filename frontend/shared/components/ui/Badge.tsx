import type { ReactNode } from 'react'

type BadgeVariant = 'danger' | 'warning' | 'success' | 'primary' | 'muted' | 'info'

const STYLES: Record<BadgeVariant, string> = {
  danger:  'bg-danger-pale text-danger-dark',
  warning: 'bg-warning-pale text-warning-dark',
  success: 'bg-success-pale text-success-dark',
  primary: 'bg-primary-pale text-primary',
  info:    'bg-primary-pale text-primary-hover',
  muted:   'bg-surface-raised text-ink-500',
}

export function Badge({
  children,
  variant = 'muted',
  className = '',
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${STYLES[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const PRIORIDAD_VARIANT: Record<string, BadgeVariant> = {
  critica: 'danger',
  alta:    'warning',
  media:   'primary',
  baja:    'muted',
}

export const ESTADO_NOVEDAD_VARIANT: Record<string, BadgeVariant> = {
  abierta:    'danger',
  en_proceso: 'warning',
  cerrada:    'success',
}

export const ORIGEN_VARIANT: Record<string, BadgeVariant> = {
  preoperacional: 'primary',
  evento:         'warning',
  manual:         'muted',
  documento:      'info',
}
