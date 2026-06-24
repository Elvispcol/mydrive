'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoutButton } from '@/shared/components/LogoutButton'
import { Badge } from '@/shared/components/ui/Badge'
import { SuperadminSidebar } from './SuperadminSidebar'
import type { Organizacion } from '@/lib/supabase/types'

const PLAN_LABELS: Record<string, string> = {
  free:       'Gratuito',
  starter:    'Starter',
  pro:        'Pro',
  enterprise: 'Enterprise',
}

interface Props {
  orgs:   Organizacion[]
  nombre: string
}

export function OrgListaPage({ orgs, nombre }: Props) {
  return (
    <div className="flex h-full">
      <SuperadminSidebar nombre={nombre} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Organizaciones</h1>
              <p className="text-sm text-ink-400 mt-1">
                {orgs.length} organización{orgs.length !== 1 ? 'es' : ''} registrada{orgs.length !== 1 ? 's' : ''} ·{' '}
                {orgs.filter(o => o.activo).length} activa{orgs.filter(o => o.activo).length !== 1 ? 's' : ''}
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-surface-raised border-b border-border">
              {['Organización', 'NIT', 'Plan', 'Estado', 'Acción'].map(h => (
                <span key={h} className="text-[11px] font-medium text-ink-500">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-border">
              {orgs.map(org => <OrgRow key={org.id} org={org} />)}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function OrgRow({ org }: { org: Organizacion }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activo, setActivo] = useState(org.activo)

  async function toggle() {
    const supabase = createClient()
    const nuevoEstado = !activo
    setActivo(nuevoEstado)
    const { error } = await supabase.from('organizacion').update({ activo: nuevoEstado }).eq('id', org.id)
    if (error) {
      setActivo(!nuevoEstado) // revert
      alert('Error al actualizar: ' + error.message)
    } else {
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-surface-raised transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">{org.nombre}</p>
        {org.pais_codigo && <p className="text-xs text-ink-400 mt-0.5">{org.pais_codigo}</p>}
      </div>
      <span className="text-sm text-ink-500 font-mono">{org.nit ?? '—'}</span>
      <Badge variant="primary">{PLAN_LABELS[org.plan_licencia] ?? org.plan_licencia}</Badge>
      <Badge variant={activo ? 'success' : 'muted'}>{activo ? 'Activa' : 'Inactiva'}</Badge>
      <button
        onClick={toggle}
        disabled={pending}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
          activo
            ? 'text-danger-dark border-danger/30 hover:bg-danger-pale'
            : 'text-success-dark border-success/30 hover:bg-success-pale'
        }`}
      >
        {activo ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}
