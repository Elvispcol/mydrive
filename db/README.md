# Base de datos — Despliegue en Supabase

Este directorio contiene el esquema completo de MyDrive y sus políticas de seguridad.
Todo fue validado en PostgreSQL 15+ (Supabase).

## Orden de aplicación

Las migraciones se aplican en orden numérico. Las políticas RLS están **dentro de cada migración**, no en un archivo separado.

```
migrations/01_nucleo_organizacional.sql
migrations/02_parque_automotor.sql
migrations/03_gestion_operacion.sql
migrations/04_seguridad_auditoria.sql
migrations/05_enterprise_foundations.sql
migrations/06_mantenimiento_preventivo.sql
migrations/07_extension_conductores.sql
migrations/08_superadmin_rls_modulos.sql
migrations/09_fix_documento_vehiculo.sql
migrations/10_auto_context_triggers.sql
seeds/01_porciento_trading.sql          ← solo en producción/dev inicial
```

> `policies/rls_policies.sql` está **deprecado**. Solo contiene `ENABLE ROW LEVEL SECURITY`
> (idempotente) y se mantiene como referencia histórica. No lo apliques en despliegues nuevos.

## Cómo aplicarlo

### Opción A — SQL Editor de Supabase (rápido para empezar)
1. Crear un proyecto en supabase.com.
2. Ir a **SQL Editor**.
3. Pegar y ejecutar cada archivo en el orden de arriba.

### Opción B — Supabase CLI (recomendado para el flujo de trabajo)
```bash
npm install -g supabase
supabase link --project-ref <tu-ref>
# Copiar los .sql a supabase/migrations/ con el prefijo de timestamp
supabase db push
```

## Estructura

```
db/
├── migrations/
│   ├── 01_nucleo_organizacional.sql   organizacion, region, usuario
│   ├── 02_parque_automotor.sql        vehiculo, documento_vehiculo (v1), asignacion
│   ├── 03_gestion_operacion.sql       checklist, preoperacional, evento,
│   │                                  novedad, tarea, mantenimiento
│   ├── 04_seguridad_auditoria.sql     funciones de contexto RLS + tabla auditoria
│   ├── 05_enterprise_foundations.sql  multi-país, updated_at, soft-delete,
│   │                                  RPC crear_preoperacional, índices
│   ├── 06_mantenimiento_preventivo.sql mantenimiento_preventivo + RLS
│   ├── 07_extension_conductores.sql   licencias en usuario, tipo_asignacion,
│   │                                  documento_vehiculo (v2 — ver nota 09)
│   ├── 08_superadmin_rls_modulos.sql  plataforma_admin, RLS completo con superadmin,
│   │                                  combustible, novedad_seguimiento, multa_infraccion,
│   │                                  taller_proveedor, mantenimiento_item,
│   │                                  contacto_emergencia, v_superadmin_resumen
│   ├── 09_fix_documento_vehiculo.sql  corrección columnas faltantes en documento_vehiculo,
│   │                                  políticas RLS definitivas para esa tabla
│   └── 10_auto_context_triggers.sql   trigger fn_ctx_org() que auto-rellena org_id
│                                      en INSERT desde el contexto del usuario autenticado
├── policies/
│   └── rls_policies.sql               DEPRECADO — ver nota arriba
└── seeds/
    └── 01_porciento_trading.sql       org "Porciento", región, Elvis como director
                                       y superadmin (aplicado 2026-06-20)
```

## Tablas por módulo

| Módulo | Tablas |
|--------|--------|
| Multi-tenant | `organizacion`, `region`, `plataforma_admin` |
| Personas | `usuario`, `contacto_emergencia` |
| Flota | `vehiculo`, `asignacion`, `documento_vehiculo` |
| Operación diaria | `preoperacional`, `preoperacional_respuesta`, `checklist_plantilla`, `checklist_item` |
| Incidencias | `evento`, `novedad`, `novedad_seguimiento`, `tarea` |
| Mantenimiento | `mantenimiento`, `mantenimiento_item`, `mantenimiento_preventivo`, `taller_proveedor` |
| Flota económica | `combustible`, `multa_infraccion` |
| Seguridad | `auditoria` |

## Arquitectura de seguridad (RLS de 3 niveles)

```
Nivel 1 — org_id          → aislamiento multi-tenant absoluto
Nivel 2 — region_id       → alcance del admin_apoyo
Nivel 3 — rol + auth_id   → el conductor solo ve lo suyo
           + superadmin   → acceso total a plataforma (plataforma_admin)
```

Funciones de contexto usadas en las políticas:
- `mydrive_org_id()`       — org del usuario actual
- `mydrive_region_id()`    — región del usuario actual
- `mydrive_rol()`          — rol del usuario actual
- `mydrive_es_nacional()`  — true si rol = director
- `mydrive_es_superadmin()` — true si existe en plataforma_admin

## Verificación post-despliegue

```sql
-- Todas las tablas deben tener rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Políticas activas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Funciones de contexto disponibles
SELECT proname FROM pg_proc
WHERE proname LIKE 'mydrive%';
```

## Enlace con Supabase Auth

La tabla `usuario` tiene `auth_id` que debe corresponder al `id` de `auth.users`.
Al crear un usuario en la app:
1. Se crea en Supabase Auth (email + contraseña o invitación).
2. Se inserta la fila en `usuario` con su `auth_id`, `org_id`, `region_id` y `rol`.

Las funciones de contexto dependen de este enlace para que la seguridad funcione.
Un superadmin también debe estar en `plataforma_admin` con el mismo `auth_id`.
