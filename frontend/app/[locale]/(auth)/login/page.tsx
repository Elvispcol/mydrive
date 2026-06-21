'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
const isDev = process.env.NODE_ENV === 'development'

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'es'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6H5l-2 4v5h2m8-9h4l2 4v5h-2m-4-9v9" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">MyDrive</h1>
          <p className="text-sm text-ink-500 mt-1">Gestión de flota vehicular</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="text-base font-semibold text-ink-900 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5 uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 placeholder:text-ink-300 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-ink-900 placeholder:text-ink-300 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-danger-dark bg-danger-pale border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary/20 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {isDev && (
          <div className="mt-4 bg-warning-pale border border-warning/20 rounded-xl p-4 text-xs text-warning-dark">
            <p className="font-semibold mb-2">Cuentas de demo:</p>
            <p>Director: <span className="font-mono">director@mydrive.demo</span></p>
            <p>Admin: <span className="font-mono">admin@mydrive.demo</span></p>
            <p>Conductor: <span className="font-mono">conductor@mydrive.demo</span></p>
            <p className="mt-1">Contraseña: <span className="font-mono">Demo1234!</span></p>
          </div>
        )}
      </div>
    </div>
  )
}
