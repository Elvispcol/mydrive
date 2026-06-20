import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { preoperacional_id } = await req.json()

    if (!preoperacional_id) {
      return json({ error: 'preoperacional_id requerido' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Cargar preoperacional con respuestas e ítems críticos
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

    if (error || !preop) return json({ error: 'Preoperacional no encontrado' }, 404)

    // Filtrar solo los ítems marcados como críticos que fallaron
    const fallas = preop.preoperacional_respuesta.filter(
      (r: any) => r.checklist_item?.critico && !r.aprobado,
    )

    if (fallas.length === 0) {
      return json({ message: 'Sin fallas críticas — no se generan novedades', novedades: [] }, 200)
    }

    // Una novedad por cada falla crítica
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

    // Actualizar resultado del preoperacional
    await supabase
      .from('preoperacional')
      .update({ resultado: 'con_novedades' })
      .eq('id', preoperacional_id)

    return json({ novedades }, 201)
  } catch (err: any) {
    return json({ error: err.message }, 500)
  }
})

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
