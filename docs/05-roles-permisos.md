# 05 — Roles y permisos

MyDrive define tres roles. La diferencia entre ellos son dos atributos del usuario:
`rol` (qué puede hacer) y `region_id` (sobre qué alcance).

## Los roles

### Director de flota (`director`)
Alcance: **nacional** (toda la organización, todas las regiones). `region_id` es
nulo. Es quien tiene la visión completa y consolidada.

- Ve y gestiona todas las regiones, vehículos, usuarios, novedades y tareas.
- Accede a los dashboards consolidados de toda la operación.
- Es el único que puede consultar la auditoría.
- Administra usuarios de cualquier región.

### Administrador de apoyo (`admin_apoyo`)
Alcance: **su región**. Hasta 5 personas (o las que el cliente requiera), cada una
ligada a su zona.

- Ve y gestiona la flota de su región: vehículos, usuarios, asignaciones.
- Recibe las novedades de su región y las convierte en tareas.
- Delega tareas a miembros de su equipo y les da seguimiento.
- Registra mantenimientos y administra la hoja de vida de sus vehículos.
- Configura los checklists del preoperacional de su organización.
- No ve datos de otras regiones.

### Conductor (`conductor`)
Alcance: **sí mismo**. Los miles de usuarios de vehículos. Experiencia móvil, lo más
simple posible.

- Diligencia su preoperacional diario.
- Reporta eventos/choques con foto y ubicación.
- Ve únicamente sus propios preoperacionales, eventos y su asignación vigente.
- No accede a gestión, ni a datos de otros conductores.

## Matriz de permisos (resumen)

| Acción | Director | Admin apoyo | Conductor |
|--------|:--------:|:-----------:|:---------:|
| Ver dashboards consolidados | ✓ | Solo su región | — |
| Gestionar vehículos | ✓ (todas) | ✓ (su región) | — |
| Gestionar usuarios | ✓ (todas) | ✓ (su región) | — |
| Crear/asignar tareas | ✓ | ✓ (su región) | — |
| Recibir tarea asignada | ✓ | ✓ | — |
| Gestionar novedades | ✓ | ✓ (su región) | — |
| Registrar mantenimiento | ✓ | ✓ (su región) | — |
| Configurar checklists | ✓ | ✓ | — |
| Diligenciar preoperacional | — | — | ✓ |
| Reportar evento | — | — | ✓ |
| Ver propios reportes | ✓ | ✓ (su región) | ✓ (solo suyos) |
| Consultar auditoría | ✓ | — | — |

Esta matriz se implementa directamente en las políticas RLS
(`db/policies/rls_policies.sql`). El permiso no se controla en el frontend: se
controla en la base de datos.

## Nota sobre escalabilidad de roles

Si en el futuro el cliente requiere roles más finos (ej. un rol de "solo lectura"
para auditoría externa, o un "jefe regional" intermedio), se añade un valor al
`check` de `rol` y las políticas correspondientes. La arquitectura lo soporta sin
rediseño.
