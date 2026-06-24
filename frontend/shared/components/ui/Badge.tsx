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
    <span className={`inline-flex items-center text-[11px] px-1.5 py-0.5 rounded font-medium ${STYLES[variant]} ${className}`}>
      {children}
    </span>
  )
}

const DOT_COLORS: Record<BadgeVariant, string> = {
  danger:  'status-dot-danger text-danger-dark',
  warning: 'status-dot-warning text-warning-dark',
  success: 'status-dot-success text-success-dark',
  primary: 'status-dot-success text-primary',
  info:    'status-dot-success text-primary-hover',
  muted:   'status-dot-muted text-ink-500',
}

export function StatusDot({
  children,
  variant = 'muted',
}: {
  children: ReactNode
  variant?: BadgeVariant
}) {
  return (
    <span className={`status-dot ${DOT_COLORS[variant]}`}>
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

export const ESTADO_VEHICULO_VARIANT: Record<string, BadgeVariant> = {
  activo:        'success',
  mantenimiento: 'warning',
  inactivo:      'muted',
  vendido:       'danger',
}

export const ESTADO_MANTENIMIENTO_VARIANT: Record<string, BadgeVariant> = {
  pendiente:  'warning',
  completado: 'success',
  vencido:    'danger',
}

export const RESULTADO_PREOP_VARIANT: Record<string, BadgeVariant> = {
  ok:            'success',
  con_novedades: 'danger',
}
