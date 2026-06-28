# Registro de Riesgos — MyDrive

> Formato: **Probabilidad** (Alta/Media/Baja) × **Impacto** (Alto/Medio/Bajo) = **Exposición**

---

## Riesgos Activos

### R-001: Credenciales Supabase en historial de git
- **Probabilidad:** Alta (ya ocurrió)
- **Impacto:** Alto (acceso total a BD, bypass de RLS)
- **Exposición:** CRÍTICA
- **Descripción:** El `SUPABASE_SERVICE_ROLE_KEY` fue commiteado en `.env.local`. Con esta key, cualquier persona puede leer o escribir en cualquier tabla de cualquier tenant, ignorando el RLS.
- **Plan de mitigación:** PC-001 + PC-002 (rotar key + limpiar historial git)
- **Fecha identificación:** 2026-06-28
- **Estado:** 🔴 Abierto

### R-002: Cero tests — regressions silenciosas
- **Probabilidad:** Alta (cada cambio es riesgo)
- **Impacto:** Alto (funcionalidad rota sin saberlo)
- **Exposición:** ALTA
- **Descripción:** Sin tests automatizados, cualquier cambio en servicios, RLS o componentes puede romper flujos críticos (preoperacional, novedad, asignación de conductor) sin que nadie lo sepa hasta que un cliente reporte.
- **Plan de mitigación:** PC-008 (tests E2E flujo crítico)
- **Fecha identificación:** 2026-06-28
- **Estado:** 🔴 Abierto

### R-003: Sin observabilidad en producción
- **Probabilidad:** Alta (primer incidente es cuestión de tiempo)
- **Impacto:** Alto (tiempo de resolución de incidentes se multiplica x5)
- **Exposición:** ALTA
- **Descripción:** Sin Sentry ni logging centralizado, cuando ocurra un error en producción no hay forma de saber qué falló, para qué usuario, en qué módulo, ni cuándo empezó.
- **Plan de mitigación:** PC-005 (Sentry)
- **Fecha identificación:** 2026-06-28
- **Estado:** 🔴 Abierto

### R-004: Un solo ambiente Supabase (dev = prod)
- **Probabilidad:** Media (mientras no haya clientes reales, impacto es bajo)
- **Impacto:** Alto (un error en dev puede borrar datos de clientes reales)
- **Exposición:** MEDIA-ALTA
- **Descripción:** El proyecto Supabase `hilyuohcubhrvdzapplp` es usado tanto para desarrollo local como para el deployment futuro. Un `DROP TABLE` accidental en dev afecta a todos los clientes.
- **Plan de mitigación:** PC-009 (separar ambientes)
- **Fecha identificación:** 2026-06-28
- **Estado:** 🟡 Abierto — Prioridad media hasta tener clientes reales

### R-005: Tipos TypeScript desincronizados con BD
- **Probabilidad:** Media (cada migración es riesgo)
- **Impacto:** Medio (errores de tipo en runtime, no en compilación)
- **Exposición:** MEDIA
- **Descripción:** Los tipos en `lib/supabase/types.ts` son manuales. Al agregar columnas en una migración, los tipos no se actualizan automáticamente. Puede haber INSERTs que TypeScript acepta pero que fallan en Supabase porque la columna no existe o el tipo es incorrecto.
- **Plan de mitigación:** PC-006 (generar tipos con supabase CLI)
- **Fecha identificación:** 2026-06-28
- **Estado:** 🟡 Abierto

### R-006: Sin middleware de protección de rutas
- **Probabilidad:** Media (un bug en cualquier page.tsx deja ruta desprotegida)
- **Impacto:** Medio (acceso no autorizado a pantallas, datos filtrados por RLS de todas formas)
- **Exposición:** MEDIA
- **Descripción:** El control de acceso está en cada `page.tsx` individualmente. Si se crea una página nueva y se olvida el check de auth/rol, la ruta queda accesible sin autenticación. El RLS protege los datos, pero la UI queda expuesta.
- **Plan de mitigación:** PC-003 (middleware.ts)
- **Fecha identificación:** 2026-06-28
- **Estado:** 🔴 Abierto

### R-007: Conductor sin capacidades mobile-first reales
- **Probabilidad:** Alta (los conductores usan teléfonos en campo)
- **Impacto:** Alto (adopción baja del producto por parte de conductores)
- **Exposición:** ALTA — para el modelo de negocio
- **Descripción:** La vista de conductor es una web app responsiva pero sin soporte offline, sin acceso a cámara nativo, sin push notifications. Los conductores en campo con mala conexión no podrán usar el sistema consistentemente.
- **Plan de mitigación:** PC-011 (PWA) — mediano plazo
- **Fecha identificación:** 2026-06-28
- **Estado:** 🟡 Abierto — Prioridad después de primer cliente real

---

## Riesgos Mitigados

| ID | Riesgo | Fecha mitigación | Cómo se resolvió |
|---|---|---|---|
| — | — | — | Ninguno mitigado aún |

---

## Riesgos Descartados

| ID | Riesgo | Fecha | Razón del descarte |
|---|---|---|---|
| — | — | — | Ninguno descartado aún |
