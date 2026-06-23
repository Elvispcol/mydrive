'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Rol } from '@/lib/supabase/types'
import { defaultLocale } from '@/lib/i18n/config'

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

function buildNav(locale: string): Record<'admin_apoyo' | 'director', NavItem[]> {
  return {
    admin_apoyo: [
      { href: `/${locale}/admin`,                  label: 'Tablero',          icon: IconGrid },
      { href: `/${locale}/admin/novedades`,         label: 'Novedades',        icon: IconAlert },
      { href: `/${locale}/admin/tareas`,            label: 'Tareas',           icon: IconClipboard },
      { href: `/${locale}/admin/vehiculos`,         label: 'Vehículos',        icon: IconTruck },
      { href: `/${locale}/admin/conductores`,       label: 'Conductores',      icon: IconUser },
      { href: `/${locale}/admin/mantenimientos`,    label: 'Mantenimientos',   icon: IconWrench },
      { href: `/${locale}/admin/combustible`,       label: 'Combustible',      icon: IconFuel },
      { href: `/${locale}/admin/multas`,            label: 'Multas',           icon: IconWarning },
      { href: `/${locale}/admin/checklist`,         label: 'Plantillas',       icon: IconList },
      { href: `/${locale}/admin/preoperacionales`,  label: 'Preoperacionales', icon: IconPreop },
    ],
    director: [
      { href: `/${locale}/director`,                    label: 'Resumen',          icon: IconGrid },
      { href: `/${locale}/director/vehiculos`,          label: 'Vehículos',        icon: IconTruck },
      { href: `/${locale}/director/conductores`,        label: 'Conductores',      icon: IconUser },
      { href: `/${locale}/director/mantenimientos`,     label: 'Mantenimientos',   icon: IconWrench },
      { href: `/${locale}/director/novedades`,          label: 'Novedades',        icon: IconAlert },
      { href: `/${locale}/director/tareas`,             label: 'Tareas',           icon: IconClipboard },
      { href: `/${locale}/director/combustible`,        label: 'Combustible',      icon: IconFuel },
      { href: `/${locale}/director/multas`,             label: 'Multas',           icon: IconWarning },
      { href: `/${locale}/director/checklist`,          label: 'Plantillas',       icon: IconList },
      { href: `/${locale}/director/preoperacionales`,   label: 'Preoperacionales', icon: IconPreop },
      { href: `/${locale}/director/usuarios`,           label: 'Usuarios',         icon: IconUsers },
      { href: `/${locale}/director/regiones`,           label: 'Regiones',         icon: IconMap },
    ],
  }
}

export function Sidebar({ rol, nombre }: { rol: Rol; nombre: string }) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || defaultLocale
  const navMap = buildNav(locale)
  const nav = rol === 'director' ? navMap.director : navMap.admin_apoyo
  const initial = nombre.charAt(0).toUpperCase()

  return (
    <aside className="w-52 bg-canvas border-r border-border flex flex-col shrink-0 h-screen sticky top-0">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <IconTruck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ink-900 tracking-tight text-sm">MyDrive</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors group ${
                active
                  ? 'bg-primary-tint text-primary-hover'
                  : 'text-ink-500 hover:bg-surface-raised hover:text-ink-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                active ? 'text-primary-hover' : 'text-ink-300 group-hover:text-ink-700'
              }`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-primary-pale flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-hover">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-900 truncate">{nombre}</p>
            <p className="text-[10px] text-ink-300 capitalize">{rol.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
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
function IconWrench({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function IconPreop({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
function IconFuel({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h10v16H3V4zM13 7h2l3 3v7a1 1 0 01-1 1h-1M7 4v4m4-4v4" />
    </svg>
  )
}
function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}
function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" />
    </svg>
  )
}
function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
