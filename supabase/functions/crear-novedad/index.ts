import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://mydrive.vercel.app',
  'https://mydrive-pmi.vercel.app',
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    Deno.env.get('ENVIRONMENT') === 'development' ||
    (origin && ALLOWED_ORIGINS.includes(origin))
      ? origin ?? ALLOWED_ORIGINS[0]
      : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405, cors)

  const authHeader = req.headers.get('authorization') ?? ''
  const userId = authHeader.replace('Bearer ', '').slice(0, 36)

  if (!checkRateLimit(userId)) {
    return json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, 429, cors)
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { preoperacional_id } = body

    if (!preoperacional_id || typeof preoperacional_id !== 'string' || !UUID_REGEX.test(preoperacional_id)) {
      return json({ error: 'preoperacional_id inválido o ausente' }, 400, cors)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: preop, error } = await supabase
      .from('preoperacional')
      .select(`
        id, org_id, region_id, vehiculo_id,
        preoperacional_respuesta (
          aprobado, nota,
          checklist_item ( id, texto, critico )
        )
      `)
      .eq('id', preoperacional_id)
      .single()

    if (error || !preop) return json({ error: 'Preoperacional no encontrado' }, 404, cors)

    const fallas = (preop.preoperacional_respuesta as any[]).filter(
      r => r.checklist_item?.critico && !r.aprobado,
    )

    if (fallas.length === 0) {
      return json({ message: 'Sin fallas críticas', novedades: [] }, 200, cors)
    }

    const { data: novedades, error: errNov } = await supabase
      .from('novedad')
      .insert(
        fallas.map((r: any) => ({
          org_id: preop.org_id,
          region_id: preop.region_id,
          vehiculo_id: preop.vehiculo_id,
          origen_tipo: 'preoperacional',
          origen_id: preop.id,
          titulo: `Falla crítica: ${r.checklist_item.texto}`,
          descripcion: r.nota ?? null,
          prioridad: 'alta',
          estado: 'abierta',
        })),
      )
      .select('id, titulo')

    if (errNov) throw errNov

    await supabase
      .from('preoperacional')
      .update({ resultado: 'con_novedades' })
      .eq('id', preoperacional_id)

    return json({ novedades }, 201, cors)
  } catch (err: any) {
    return json({ error: err.message ?? 'Error interno' }, 500, cors)
  }
})

function json(data: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
