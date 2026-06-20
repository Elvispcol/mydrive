import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { evento_id } = await req.json()

    if (!evento_id) return json({ error: 'evento_id requerido' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Cargar evento con datos del vehículo y el conductor
    const { data: evento, error } = await supabase
      .from('evento')
      .select(`
        id, org_id, region_id, vehiculo_id, tipo, descripcion, foto_url, lat, lng, creado_en,
        vehiculo ( placa, marca, modelo ),
        usuario ( nombre, email, telefono )
      `)
      .eq('id', evento_id)
      .single()

    if (error || !evento) return json({ error: 'Evento no encontrado' }, 404)

    // Registrar novedad en el tablero del administrador
    const { data: novedad, error: errNov } = await supabase
      .from('novedad')
      .insert({
        org_id: evento.org_id,
        region_id: evento.region_id,
        vehiculo_id: evento.vehiculo_id,
        origen_tipo: 'evento',
        origen_id: evento.id,
        titulo: `${evento.tipo.toUpperCase()}: ${(evento.vehiculo as any)?.placa ?? 'vehículo sin placa'}`,
        descripcion: evento.descripcion,
        prioridad: 'critica',
        estado: 'abierta',
      })
      .select('id')
      .single()

    if (errNov) throw errNov

    // Enviar correo de alerta con Resend
    await enviarCorreo(evento)

    return json({ novedad_id: novedad.id }, 201)
  } catch (err: any) {
    return json({ error: err.message }, 500)
  }
})

async function enviarCorreo(evento: any) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const destino = Deno.env.get('CORREO_FLOTA_DESTINO')

  if (!apiKey || !destino) return

  const fecha = new Date(evento.creado_en).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const ubicacion =
    evento.lat && evento.lng
      ? `https://maps.google.com/?q=${evento.lat},${evento.lng}`
      : null

  const fila = (label: string, valor: string) =>
    `<tr>
      <td style="padding:8px 12px;font-weight:600;white-space:nowrap;color:#374151">${label}</td>
      <td style="padding:8px 12px;color:#111827">${valor}</td>
    </tr>`

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#dc2626;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0">Evento reportado: ${evento.tipo.toUpperCase()}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb">
        ${fila('Vehículo', `${evento.vehiculo?.placa} — ${evento.vehiculo?.marca} ${evento.vehiculo?.modelo}`)}
        ${fila('Conductor', `${evento.usuario?.nombre} · ${evento.usuario?.telefono ?? evento.usuario?.email}`)}
        ${fila('Tipo', evento.tipo)}
        ${fila('Descripción', evento.descripcion ?? '—')}
        ${fila('Fecha', fecha)}
        ${ubicacion ? fila('Ubicación', `<a href="${ubicacion}">Ver en Google Maps</a>`) : ''}
        ${evento.foto_url ? fila('Foto', `<a href="${evento.foto_url}">Ver foto adjunta</a>`) : ''}
      </table>
      <p style="padding:12px 16px;color:#6b7280;font-size:13px">
        La novedad ya fue registrada en MyDrive y está disponible en el tablero del administrador.
      </p>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'MyDrive <alertas@mydrive.app>',
      to: [destino],
      subject: `[MyDrive] ${evento.tipo.toUpperCase()} — ${evento.vehiculo?.placa ?? evento.id}`,
      html,
    }),
  })
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
