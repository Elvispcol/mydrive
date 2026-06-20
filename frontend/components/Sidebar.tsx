'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Rol } from '@/lib/supabase/types'

const NAV_ADMIN = [
  { href: '/admin',              label: 'Tablero',     icon: IconGrid },
  { href: '/admin/novedades',    label: 'Novedades',   icon: IconAlert },
  { href: '/admin/tareas',       label: 'Tareas',      icon: IconClipboard },
  { href: '/admin/vehiculos',    label: 'Vehículos',   icon: IconTruck },
  { href: '/admin/conductores',  label: 'Conductores', icon: IconUser },
]

const NAV_DIRECTOR = [
  { href: '/director',           label: 'Resumen',   icon: IconGrid },
  { href: '/director/novedades', label: 'Novedades', icon: IconAlert },
  { href: '/director/regiones',  label: 'Regiones',  icon: IconMap },
  { href: '/director/vehiculos', label: 'Vehículos', icon: IconTruck },
]

export default function Sidebar({ rol, nombre }: { rol: Rol; nombre: string }) {
  const pathname = usePathname()
  const nav = rol === 'director' ? NAV_DIRECTOR : NAV_ADMIN

  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <IconTruck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ink-900 tracking-tight">MyDrive</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-pale text-primary'
                  : 'text-ink-500 hover:bg-surface-raised hover:text-ink-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-ink-300'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-primary-pale flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">{nombre.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-900 truncate">{nombre}</p>
            <p className="text-xs text-ink-300 capitalize">{rol.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

function IconClipboard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function IconTruck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
    </svg>
  )
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function IconMap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}
