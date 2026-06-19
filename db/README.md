# Base de datos — Despliegue en Supabase

Este directorio contiene el esquema completo de MyDrive y sus políticas de seguridad.
Todo fue validado en PostgreSQL 16.

## Orden de aplicación

Las migraciones se aplican en orden numérico, y las políticas RLS al final:

```
migrations/01_nucleo_organizacional.sql
migrations/02_parque_automotor.sql
migrations/03_gestion_operacion.sql
migrations/04_seguridad_auditoria.sql
policies/rls_policies.sql
```

## Cómo aplicarlo

### Opción A — SQL Editor de Supabase (rápido para empezar)
1. Crear un proyecto en supabase.com.
2. Ir a SQL Editor.
3. Pegar y ejecutar cada archivo en el orden de arriba.

### Opción B — Supabase CLI (recomendado para el flujo de trabajo)
```bash
# Instalar la CLI
npm install -g supabase

# Enlazar al proyecto
supabase link --project-ref <tu-ref>

# Aplicar el esquema (copiar los .sql a supabase/migrations/ con el formato de la CLI)
supabase db push
```

## Estructura

```
db/
├── migrations/
│   ├── 01_nucleo_organizacional.sql   Organización, región, usuario
│   ├── 02_parque_automotor.sql        Vehículo, documentos, asignaciones
│   ├── 03_gestion_operacion.sql       Checklist, preoperacional, evento,
│   │                                  novedad, tarea, mantenimiento
│   └── 04_seguridad_auditoria.sql     Funciones de contexto, auditoría
└── policies/
    └── rls_policies.sql               Las 29 políticas del muro de 3 niveles
```

## Verificación post-despliegue

Tras aplicar todo, estas consultas confirman que la seguridad está activa:

```sql
-- Todas las tablas deben tener rowsecurity = true
select tablename, rowsecurity from pg_tables where schemaname = 'public';

-- Deben existir las políticas
select tablename, policyname from pg_policies where schemaname = 'public';
```

## Datos de prueba

Para la Fase 3, se necesitará un seed con una organización de demo, dos regiones,
usuarios de cada rol y algunos vehículos. Ese archivo (`seed.sql`) se crea al
iniciar el MVP funcional, no se incluye aquí para mantener el esquema limpio.

## Importante sobre el enlace con Auth

La tabla `usuario` tiene un campo `auth_id` que debe corresponder al `id` de
`auth.users` de Supabase. Al crear un usuario en la app:
1. Se crea en Supabase Auth (email + contraseña o invitación).
2. Se inserta la fila en `usuario` con su `auth_id`, `org_id`, `region_id` y `rol`.

Las funciones de contexto (`mydrive_org_id()`, etc.) dependen de este enlace para
que la seguridad funcione.
