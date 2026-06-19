# 04 — Seguridad

La seguridad de MyDrive no es una capa añadida: es la arquitectura. Como el sistema
maneja datos personales de conductores y opera para clientes corporativos con redes
estrictas, el aislamiento de datos vive en el motor de la base de datos, no en el
código de aplicación.

Este documento es también el argumento de venta ante el área de TI del cliente.

## El muro de aislamiento de tres niveles

Toda consulta a la base de datos filtra automáticamente las filas **antes** de
devolver una sola, mediante Row Level Security (RLS) de PostgreSQL.

### Muro 1 — Organización (multi-tenant)
Cada usuario pertenece a una organización (`org_id`). Toda política exige
`org_id = mydrive_org_id()`. Es físicamente imposible que una consulta de un cliente
devuelva datos de otro, porque la base de datos bloquea las filas en la capa más
profunda. Ni un error en el frontend puede romper esto.

### Muro 2 — Región (alcance del equipo)
Un administrador de apoyo solo recibe filas de su `region_id`. El director de flota
(rol nacional) atraviesa este filtro y ve todas las regiones de su organización.

### Muro 3 — Rol (mínimo privilegio)
Un conductor solo ve sus propios preoperacionales y eventos, nunca los de otro
conductor ni la gestión. Crear o editar vehículos, usuarios, novedades y tareas está
restringido a director y administrador de apoyo dentro de su alcance.

## Por qué esto importa para el cliente

El aislamiento **no depende de que el programador no se equivoque** en cada consulta.
Está garantizado por el motor de PostgreSQL. Esta es exactamente la garantía que un
área de seguridad corporativa quiere: la protección es estructural, no procedimental.

## Funciones de contexto

Las políticas usan funciones auxiliares (`mydrive_org_id()`, `mydrive_region_id()`,
`mydrive_rol()`, `mydrive_es_nacional()`) que leen el contexto del usuario autenticado
a partir de `auth.uid()` de Supabase. Son `security definer` con `search_path`
fijado, para evitar recursión y escalamiento.

## Auditoría

La tabla `auditoria` registra de forma inmutable cada inserción, actualización y
borrado en las tablas sensibles (vehículos, usuarios, asignaciones, eventos,
novedades, tareas, mantenimientos), con el usuario, la marca de tiempo, y el estado
antes y después. Solo el director puede consultar la auditoría de su organización.

## Datos personales y cumplimiento

MyDrive maneja datos personales de conductores (nombre, documento, teléfono,
ubicación de eventos). Implicaciones:

- En Colombia aplica la Ley 1581 de 2012 de protección de datos personales. Se
  requiere un acuerdo de tratamiento de datos con cada cliente y una política de
  privacidad.
- Para otros países de operación, cada uno tiene su propio régimen; la expansión
  multi-país debe validar el marco legal local (ver roadmap, Fase 6).
- Principio de minimización: solo se capturan los datos necesarios para la operación.
- Las fotos de eventos y documentos se almacenan en Supabase Storage con las mismas
  reglas de acceso por organización y región.

## Buenas prácticas operativas

- Todo el tráfico sobre TLS.
- Los secretos (claves de servicio, API keys de correo) viven en variables de
  entorno del servidor, nunca en el cliente ni en el repositorio.
- Las operaciones sensibles (crear novedad desde preoperacional, disparar correo)
  corren en Edge Functions del servidor, no en el navegador.
- Endurecimiento de producción (pruebas de carga, revisión de seguridad formal) se
  aborda en la Fase 5 antes de escalar.

## Aviso

Este documento describe la arquitectura de seguridad técnica. No constituye asesoría
legal. El cumplimiento de protección de datos en cada jurisdicción debe validarse
con un profesional legal.
