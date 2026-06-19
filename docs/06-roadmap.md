# 06 — Roadmap

El principio que ordena este roadmap: **el compromiso y el presupuesto del cliente
llegan al final de la Fase 1, no al final de todo.** Se construye lo mínimo para
vender, se vende, y luego se construye lo robusto con respaldo. Eso protege el tiempo
y la reputación.

## Fase 0 — Fundamentos comerciales y legales
*En paralelo, ~1 semana*

Definir nombre de producto (MyDrive), modelo de licencia por profundidad, y el marco
legal mínimo (acuerdo de tratamiento de datos bajo Ley 1581). No trabarse aquí, pero
tenerlo en el radar.

## Fase 1 — Maqueta navegable para vender
*1–2 semanas*

La demo del "wow", generada con v0 sin backend real, con datos de ejemplo: app del
conductor (preoperacional + reportar evento), tablero del administrador (el centro),
vista del director. Desplegada a la URL de v0 para mostrarle al cliente.
**Objetivo: conseguir el compromiso con cifras.** Estas pantallas se reutilizan en
la Fase 3.

## Fase 2 — Base de datos y arquitectura segura
*1 semana — COMPLETADA en este repositorio*

Modelo de datos en Supabase, políticas de Row Level Security, auditoría. Es la fase
invisible pero la más importante. Las migraciones y políticas ya están definidas y
validadas en `db/`.

## Fase 3 — MVP funcional
*3–5 semanas*

Conectar las pantallas de la Fase 1 al backend de la Fase 2. El conductor diligencia
el preoperacional y se guarda; reporta un choque con foto y llega por correo a flota;
el director ve cumplimiento en vivo; el administrador gestiona usuarios y vehículos
y delega tareas. Autenticación con roles funcionando. Listo para piloto reducido.

## Fase 4 — Administración de flota completa
*4–6 semanas*

Lo que hoy llevan en Excel: hoja de vida completa, mantenimientos preventivos con
alertas, mantenimientos que surgen de preoperacionales, ciclo de vida completo
(asignación, cambio, salida, venta, fechas), reporte quincenal automático,
dashboards de gestión unificados. Esto da el "alto impacto" que justifica pagar más
que por el sistema anterior.

## Fase 5 — Endurecimiento y producción
*3–4 semanas*

Antes de escalar a miles: refinamiento de auditoría, manejo de secretos, modo
offline en la app del conductor (sin señal en carretera), pruebas de carga, y la
documentación de seguridad que el área de TI del cliente exigirá. Aquí "redes
corporativas estrictas" se vuelve real.

## Fase 6 — Piloto, escalamiento y multi-país
*Continuo*

Piloto controlado con un subconjunto de la flota, escalamiento progresivo, y
adaptación para otros países de las Américas (cada uno con su régimen de datos). Es
también cuando el producto está listo para el cliente #2.

## Estado actual

```
Fase 0  ▓▓▓▓▓░░░░░  en preparación
Fase 1  ░░░░░░░░░░  pendiente (maqueta v0)
Fase 2  ▓▓▓▓▓▓▓▓▓▓  COMPLETADA (este repositorio)
Fase 3  ░░░░░░░░░░  pendiente
```
