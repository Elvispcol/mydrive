import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// createServerClient<any> evita el false-positive never en .single()
// que ocurre con tipos artesanales. Pendiente supabase gen types typescript
// cuando se instale la CLI para obtener tipos inferidos correctamente.
export async function createClient() {
  const cookieStore = await cookies()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // En Server Components los cookies son de solo lectura — ignorar
          }
        },
      },
    },
  )
}
