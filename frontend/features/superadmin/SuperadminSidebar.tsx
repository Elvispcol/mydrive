'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export function SuperadminSidebar({ nombre }: { nombre: string }) {
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || defaultLocale
  const base     = `/${locale}/superadmin`

  const nav = [
    { href: base,                    label: 'Organizaciones', icon: IconBuilding },
  ]

  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center shrink-0">
            <IconShield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-ink-900 tracking-tight text-sm">MyDrive</span>
            <p className="text-xs text-ink-300 leading-none">Superadmin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon   = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-ink-100 text-ink-900' : 'text-ink-500 hover:bg-surface-raised hover:text-ink-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-ink-700' : 'text-ink-300'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-ink-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-ink-700">{nombre.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-900 truncate">{nombre}</p>
            <p className="text-xs text-ink-300">Superadmin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  )
}
function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  )
}
