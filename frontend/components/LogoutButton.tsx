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
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Salir
      </button>
    )
  }

  return (
    <button onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
      Cerrar sesión
    </button>
  )
}
