import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient<any> — mismo motivo que server.ts:
// Database manual causa never en .single(). Pendiente supabase gen types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
