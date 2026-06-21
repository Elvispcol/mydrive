// process.env[key] dinámico no funciona en el browser — Next.js solo reemplaza
// accesos estáticos (process.env.NEXT_PUBLIC_X). Este módulo es solo servidor.
function requireEnv(key: string): string {
  // Acceso estático para que Next.js pueda reemplazar en build
  const known: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
  const value = known[key] ?? process.env[key]
  if (!value) throw new Error(`[env] Variable requerida ausente: ${key}`)
  return value
}

function optionalEnv(key: string): string | undefined {
  const known: Record<string, string | undefined> = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
  return known[key] ?? process.env[key] ?? undefined
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL:      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY:     optionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  NODE_ENV:                      process.env.NODE_ENV ?? 'development',
} as const

export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
