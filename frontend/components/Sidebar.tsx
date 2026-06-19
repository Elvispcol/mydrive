'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Rol } from '@/lib/supabase/types'

const NAV_ADMIN = [
  { href: '/admin',    label: 'Tablero',    icon: '📊' },
  { href: '/admin/novedades', label: 'Novedades', icon: '⚠️' },
  { href: '/admin/tareas',    label: 'Tareas',    icon: '📋' },
  { href: '/admin/vehiculos', label: 'Vehículos', icon: '🚛' },
  { href: '/admin/conductores', label: 'Conductores', icon: '👤' },
]

const NAV_DIRECTOR = [
  { href: '/director', label: 'Resumen',    icon: '📊' },
  { href: '/director/novedades', label: 'Novedades', icon: '⚠️' },
  { href: '/director/regiones',  label: 'Regiones',  icon: '🗺️' },
  { href: '/director/vehiculos', label: 'Vehículos', icon: '🚛' },
]

export default function Sidebar({ rol, nombre }: { rol: Rol; nombre: string }) {
  const pathname = usePathname()
  const nav = rol === 'director' ? NAV_DIRECTOR : NAV_ADMIN

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">MyDrive</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-900 truncate">{nombre}</p>
        <p className="text-xs text-gray-400 capitalize">{rol.replace('_', ' ')}</p>
      </div>
    </aside>
  )
}
