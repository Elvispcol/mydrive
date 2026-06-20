import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale, isValidLocale } from '@/lib/i18n/config'

function detectLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  for (const segment of acceptLanguage.split(',')) {
    const tag = segment.trim().split(';')[0].toLowerCase()
    // Match exact locale (es, en, pt, fr, de, it, ja)
    const short = tag.split('-')[0]
    if (isValidLocale(short)) return short
  }
  return defaultLocale
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|css|js)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a valid locale prefix
  const segments = pathname.split('/')
  const firstSegment = segments[1] ?? ''

  if (!isValidLocale(firstSegment)) {
    // Redirect to locale-prefixed path
    const locale = detectLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  // Locale is present — refresh Supabase session
  let supabaseResponse = NextResponse.next({ request })

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

  const { data: { user } } = await supabase.auth.getUser()

  const locale = firstSegment
  const isLoginPath = pathname === `/${locale}/login`

  // Unauthenticated → redirect to login (unless already there)
  if (!user && !isLoginPath) {
    request.nextUrl.pathname = `/${locale}/login`
    return NextResponse.redirect(request.nextUrl)
  }

  // Authenticated on login → redirect to home
  if (user && isLoginPath) {
    request.nextUrl.pathname = `/${locale}`
    return NextResponse.redirect(request.nextUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
