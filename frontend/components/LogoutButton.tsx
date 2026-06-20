'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ small = false }: { small?: boolean }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (small) {
    return (
      <button onClick={handleLogout}
        className="text-xs text-ink-300 hover:text-ink-500 transition-colors">
        Salir
      </button>
    )
  }

  return (
    <button onClick={handleLogout}
      className="text-sm text-ink-500 hover:text-ink-900 border border-border rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-raised">
      Cerrar sesión
    </button>
  )
}
