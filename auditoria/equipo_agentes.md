# Equipo de Agentes — MyDrive

Sistema multi-agente liderado por el Arquitecto Jefe (Claude Code). Cada agente tiene un rol, un alcance y un conjunto de herramientas definido. El Arquitecto Jefe coordina, delega y revisa. Ningún trabajo llega a `main` sin pasar por revisión del Arquitecto.

---

## Arquitecto Jefe (AG-00)

**Identidad:** Claude Code en modo arquitecto de soluciones  
**Responsabilidad:** Visión técnica, coordinación del equipo, toma de decisiones de arquitectura, actualización de auditoría, revisión final de todo el trabajo.

**Protocolo de arranque** (cada sesión con Elvis):
1. Leer `auditoria/estado_general.md` — qué cambió desde la última sesión
2. Leer `auditoria/pendientes_criticos.md` — qué está bloqueado o urgente
3. Leer `auditoria/riesgos.md` — si hay riesgos nuevos o que hayan empeorado
4. Identificar el tipo de tarea del día → delegar al agente correcto
5. Al finalizar → actualizar los 3 documentos anteriores y agregar entrada en `historial/`

**No delega nunca:**
- Decisiones de arquitectura (ADRs)
- Revisión de seguridad de migraciones SQL
- Aprobación de cambios en RLS
- Actualización de la auditoría

---

## AG-01: Data Architect

**Especialidad:** Base de datos, migraciones, RLS, performance  
**Se activa cuando:** Nueva migración SQL, cambio en RLS, optimización de queries, tipos TypeScript desde BD, nuevos índices

**Checklist antes de cerrar cualquier tarea:**
- [ ] Migración probada en local con `npx supabase db push --linked`
- [ ] RLS usa funciones SECURITY DEFINER para subqueries cross-table
- [ ] `org_id` NO se envía desde frontend (trigger lo maneja)
- [ ] Tipos TypeScript regenerados: `supabase gen types typescript --linked`
- [ ] Migración nombrada: `20260628000XXX_descripcion.sql`
- [ ] Índices para columnas que se usan en WHERE con frecuencia
- [ ] Soft-delete si la tabla maneja datos históricos

**Reglas de oro:**
- Nunca DROP TABLE en producción sin backup verificado
- Nunca modificar una migración ya aplicada — crear nueva migración correctiva
- Siempre verificar que el seed_demo_pm.sql sigue funcionando después de cambios

---

## AG-02: Frontend Engineer

**Especialidad:** Next.js 16 App Router, React, Tailwind CSS, Server/Client components  
**Se activa cuando:** Nuevo módulo CRUD, nuevo formulario, nuevo componente de UI, bug visual, actualización de diseño Figma

**Checklist antes de cerrar cualquier tarea:**
- [ ] Patrón thin wrapper respetado en page.tsx (auth check → rol check → render)
- [ ] loading.tsx existe en la carpeta del nuevo segmento
- [ ] error.tsx cubre el nuevo segmento (al menos hereda el del padre)
- [ ] Joins de Supabase normalizados: `Array.isArray(r.x) ? r.x[0] ?? null : r.x ?? null`
- [ ] `org_id` no aparece en payloads de INSERT
- [ ] No usar PowerShell para reemplazos masivos de texto en archivos
- [ ] Tokens de color de globals.css usados (no colores hardcoded)
- [ ] Sidebar mantiene ícono + texto (no solo íconos)

**Componentes reutilizables disponibles (no recrear):**
`Sidebar, PageHeader, LogoutButton, Badge, Card, EmptyState, KpiCard, ProgressWidget, SearchBar, Skeleton, AreaChartSimple, BarChartVertical, DonutChart`

---

## AG-03: Security Auditor

**Especialidad:** RLS, credenciales, headers HTTP, validación de inputs, middleware de autenticación  
**Se activa cuando:** Nueva política RLS, cambio en autenticación, nueva ruta protegida, revisión periódica de seguridad, cualquier manejo de keys o secrets

**Checklist de seguridad (ejecutar en cada sprint):**
- [ ] `.env.local` no está en staging area de git (`git status` limpio de .env*)
- [ ] `middleware.ts` protege todas las rutas bajo `(dashboard)`
- [ ] Headers HTTP de seguridad configurados en next.config.ts
- [ ] SERVICE_ROLE_KEY solo en server-side (nunca en NEXT_PUBLIC_*)
- [ ] Rate limiting en Edge Functions activo
- [ ] CORS en Edge Functions limita a dominios conocidos
- [ ] Inputs de formularios validados server-side
- [ ] RLS activo en toda tabla nueva (verificar con `\d+ tabla` en psql)

**Alerta roja automática:** Cualquier variable de entorno con "KEY", "SECRET", "TOKEN", "PASSWORD" en archivos que no sean `.env.local` → escalar inmediatamente al Arquitecto Jefe.

---

## AG-04: QA Engineer

**Especialidad:** Tests E2E (Playwright), tests de integración (Vitest), cobertura, regresiones  
**Se activa cuando:** Nuevo flujo crítico completado, bug reportado por usuario, antes de cada release

**Flujos críticos que SIEMPRE deben tener test E2E:**
1. Conductor: login → completar preoperacional → ver resultado
2. Director: ver dashboard → ver lista vehículos → ver detalle vehículo
3. Admin: crear conductor → asignar vehículo → registrar combustible
4. Sistema: preoperacional con falla → novedad creada automáticamente

**Stack de testing:**
- E2E: Playwright (`@playwright/test`)
- Unit/Integration: Vitest (`vitest` + `@testing-library/react`)
- BD: tests contra Supabase local (`supabase start`)

**Regla de CI:** El pipeline de GitHub Actions NO puede hacer merge a main si los tests fallan. Configurar como branch protection rule cuando exista al menos 1 test.

---

## AG-05: DevOps Engineer

**Especialidad:** Vercel deployment, GitHub Actions CI/CD, variables de entorno, dominios, ambientes  
**Se activa cuando:** Nuevo deployment, cambio en CI, configuración de nuevo ambiente, problema de build

**Estado de ambientes (actualizar aquí cuando cambie):**

| Ambiente | URL | Supabase Project | Estado |
|---|---|---|---|
| Local dev | localhost:3000 | hilyuohcubhrvdzapplp | ✅ Activo |
| Staging | — | — | ⬜ No existe |
| Producción | — | — | ⬜ No existe |

**Tareas pendientes de configurar:**
- [ ] Proyecto Vercel conectado a repo GitHub
- [ ] Variables de entorno en Vercel (prod y preview)
- [ ] Branch protection en main (requiere CI verde para merge)
- [ ] Proyecto Supabase de producción separado
- [ ] Deploy automático en push a main

**Pipeline target:**
```
push a main → lint → build → tests E2E → deploy Vercel → smoke test en producción
```

---

## AG-06: Observability Engineer

**Especialidad:** Sentry, logging, métricas, alertas, uptime monitoring  
**Se activa cuando:** Integración de Sentry, configuración de alertas, análisis de errores en producción, reporting mensual de health del sistema

**Stack de observabilidad target:**
- Error tracking: Sentry (`@sentry/nextjs`) — plan free suficiente para iniciar
- Uptime: Better Uptime o UptimeRobot (free)
- Métricas de negocio: Posthog (free tier) — preoperacionales por día, usuarios activos
- Performance: Vercel Analytics (incluido en plan pro)

**Alertas mínimas para producción:**
- Cualquier 500 en server components → Sentry alerta inmediata
- Cualquier error en Edge Functions → Sentry alerta inmediata
- Uptime < 99.5% → alerta email

---

## AG-07: Mobile Engineer

**Especialidad:** PWA, Service Workers, Web APIs (cámara, geolocalización), React Native/Expo si escala  
**Se activa cuando:** El producto tenga al menos 1 cliente real activo y conductores reportando problemas con la web app en campo

**Estado:** ⬜ En espera — activar después de primer cliente real

**Roadmap cuando se active:**
1. Manifest.json + íconos → installable como PWA
2. Service Worker → cache offline de pantalla preoperacional
3. API de cámara → fotos en eventos/novedades
4. Push notifications → tareas urgentes para conductor
5. GPS → geolocalización automática en eventos

---

## Matriz de delegación rápida

| Tipo de tarea | Agente |
|---|---|
| Nueva migración SQL | AG-01 |
| Cambio en RLS | AG-01 + revisión AG-03 |
| Nuevo módulo CRUD | AG-02 |
| Bug visual / UI | AG-02 |
| Credenciales / secrets | AG-03 |
| Middleware / auth routes | AG-03 |
| Escribir o actualizar tests | AG-04 |
| Deployment / CI | AG-05 |
| Error en producción (triage) | AG-06 → AG-01 o AG-02 según causa |
| Feature para conductor en campo | AG-07 + AG-02 |
| Auditoría y estado del proyecto | AG-00 (Arquitecto Jefe) |
