import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: perfil } = await supabase
    .from('usuario')
    .select('rol')
    .eq('auth_id', user.id)
    .single()

  if (!perfil || !['director'].includes(perfil.rol)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const body = await req.json()
  const { nombre, email, password, rol, documento, celular, ciudad, cargo, region_id, fecha_ingreso } = body

  if (!nombre || !email || !password || !rol) {
    return NextResponse.json({ error: 'Campos requeridos: nombre, email, password, rol' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { data: nuevoUsuario, error: dbError } = await supabase
    .from('usuario')
    .insert({
      auth_id: authUser.user.id,
      nombre: nombre.trim(),
      email,
      rol,
      documento: documento || null,
      celular: celular || null,
      ciudad: ciudad || null,
      cargo: cargo || null,
      region_id: region_id || null,
      fecha_ingreso: fecha_ingreso || null,
      activo: true,
    })
    .select()
    .single()

  if (dbError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ usuario: nuevoUsuario }, { status: 201 })
}
