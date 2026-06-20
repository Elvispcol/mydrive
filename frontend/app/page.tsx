import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Raíz: redirige según el rol del usuario autenticado.
// El middleware ya garantiza que solo usuarios con sesión llegan aquí.
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuario')
    .select('rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil) redirect('/login')

  switch (perfil.rol) {
    case 'director':   redirect('/director')
    case 'admin_apoyo': redirect('/admin')
    case 'conductor':  redirect('/conductor')
    default:           redirect('/login')
  }
}
