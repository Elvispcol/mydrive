# 03 — Modelo de datos

El modelo respeta una jerarquía de tres niveles —organización → región →
(vehículos, usuarios)— y una cadena de valor que conecta la captura en campo con
la gestión: preoperacional/evento → novedad → tarea → mantenimiento.

## Las tablas

### Núcleo organizacional

| Tabla | Rol |
|-------|-----|
| `organizacion` | El tenant. Cada cliente es una fila. Todo cuelga de su `id`. Contiene `plan_licencia` (tier contratado). |
| `region` | Sedes o zonas del cliente. Define el alcance de los administradores de apoyo. |
| `usuario` | Toda la gente. Se diferencia por `rol` (director / admin_apoyo / conductor) y `region_id`. `auth_id` enlaza con Supabase Auth. |

### Parque automotor y ciclo de vida

| Tabla | Rol |
|-------|-----|
| `vehiculo` | La hoja de vida. `estado` rastrea el ciclo (activo / mantenimiento / inactivo / vendido). |
| `documento_vehiculo` | SOAT, tecnomecánica, pólizas con `vence_en` para alertas. |
| `asignacion` | Quién maneja qué vehículo y entre qué fechas. Resuelve cambios, salidas y ventas con `hasta` — nunca borra. Solo una asignación vigente por vehículo (índice único). |

### Captura, gestión y la cadena de valor

| Tabla | Rol |
|-------|-----|
| `checklist_plantilla` / `checklist_item` | El preoperacional es configurable. El admin edita ítems desde su panel. `critico` marca los ítems que, al fallar, generan novedad. |
| `preoperacional` / `preoperacional_respuesta` | La inspección diaria del conductor y su detalle ítem por ítem. |
| `evento` | Reporte de choque/siniestro con foto, ubicación y estado. |
| `novedad` | El corazón de la gestión. Nace de un preoperacional con falla, un evento, o manual. Entra al tablero del administrador. |
| `tarea` | La delegación. El admin asigna a su equipo (`asignado_a`), con prioridad, vencimiento y estado. |
| `mantenimiento` | Cierra el círculo y queda en la hoja de vida. `proximo_en` permite mantenimiento preventivo programado. |

### Seguridad

| Tabla | Rol |
|-------|-----|
| `auditoria` | Registro inmutable de quién hizo qué y cuándo, alimentado por triggers en las tablas sensibles. |

## La cadena de valor en datos

```
preoperacional (resultado='con_novedades')
   └─> novedad (origen_tipo='preoperacional', origen_id=<preop>)
         └─> tarea (novedad_id, asignado_a=<miembro del equipo>)
               └─> mantenimiento (tarea_id, vehiculo_id)
                     └─> queda en la hoja de vida del vehículo
```

Lo mismo ocurre desde un `evento`. Esa trazabilidad de extremo a extremo es lo que
diferencia a MyDrive de un sistema de captura.

## Decisiones de diseño clave

- **`org_id` redundante en tablas hijas.** Tablas como `preoperacional` o `evento`
  llevan `org_id` y `region_id` directamente, aunque podrían derivarse del vehículo.
  Es deliberado: simplifica y acelera las políticas RLS, que filtran sin joins.
- **Sin borrados lógicos por defecto.** El histórico se preserva con fechas y
  estados, no con `DELETE`. Las claves foráneas usan `on delete restrict` para
  proteger la integridad histórica.
- **Configuración como datos.** Checklists y catálogos son filas editables, no
  código. Sostiene la promesa comercial de cambios sin costo.

El diagrama entidad-relación completo se mantiene en el material de arquitectura del
proyecto.
