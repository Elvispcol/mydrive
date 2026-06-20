function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`[env] Variable requerida ausente: ${key}`)
  return value
}

function optionalEnv(key: string): string | undefined {
  return process.env[key] || undefined
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL:      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY:     optionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  NODE_ENV:                      process.env.NODE_ENV ?? 'development',
} as const

export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
