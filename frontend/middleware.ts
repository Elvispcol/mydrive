import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DASHBOARD_SEGMENTS = ['admin', 'director', 'conductor', 'superadmin']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Crear cliente Supabase SSR que refresca la sesión en cada request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refrescar sesión — crítico: no añadir lógica entre createServerClient y getUser
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Detectar si la ruta es un segmento de dashboard protegido
  // Ejemplo: /es/admin, /es/director/vehiculos, /en/conductor, etc.
  const isDashboardRoute = DASHBOARD_SEGMENTS.some((seg) => {
    // Coincide con /:locale/:seg o /:locale/:seg/...
    return pathname.match(new RegExp(`^/[^/]+/${seg}(/|$)`))
  })

  if (isDashboardRoute && !user) {
    // Sin sesión intentando acceder al dashboard → redirigir al login
    const locale = pathname.split('/')[1] ?? 'es'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml
     * - archivos con extensión (imágenes, fuentes, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
}
