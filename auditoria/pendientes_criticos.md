# Pendientes Críticos — MyDrive

Ítems que **deben resolverse** antes de tener clientes reales. Ordenados por urgencia.

> Regla: un ítem se mueve a "Completado" solo cuando está en producción real, no cuando está en rama local.

---

## URGENTE — Seguridad (hacer HOY)

### PC-001: Rotar credenciales de Supabase
- **Riesgo:** SUPABASE_SERVICE_ROLE_KEY commiteado en git history bypasea todo el RLS
- **Qué hacer:**
  1. Ir a Supabase Dashboard → Settings → API
  2. Generar nuevo `service_role` key
  3. Actualizar `.env.local` local
  4. Actualizar GitHub Secrets en el repo
  5. Verificar que las Edge Functions y API routes siguen funcionando
- **Tiempo estimado:** 30 minutos
- **Estado:** ⬜ Pendiente

### PC-002: Excluir .env.local del historial de git
- **Riesgo:** Las keys siguen en git history aunque se actualice .gitignore
- **Qué hacer:**
  1. Verificar que `.env.local` está en `.gitignore`
  2. Limpiar historial: `git filter-repo --invert-paths --path frontend/.env.local`
  3. Force push a main (coordinado, no hay otros developers)
- **Tiempo estimado:** 1 hora
- **Nota:** Hacer DESPUÉS de rotar las keys (PC-001)
- **Estado:** ⬜ Pendiente

---

## BLOQUEANTE — Sin esto no hay producción real

### PC-003: Crear middleware.ts de protección de rutas
- **Riesgo:** Sin middleware, las rutas del dashboard no están centralmente protegidas
- **Qué hacer:** Crear `frontend/middleware.ts` que:
  - Intercepte todas las rutas bajo `/(dashboard)/`
  - Verifique sesión Supabase SSR
  - Redirija a login si no hay sesión
  - Redirija según rol (director → /director, admin → /admin, conductor → /conductor)
- **Tiempo estimado:** 2-3 horas
- **Estado:** ⬜ Pendiente

### PC-004: Desplegar en Vercel
- **Riesgo:** El producto no existe para nadie más que el developer local
- **Qué hacer:**
  1. Crear proyecto en vercel.com conectado al repo GitHub
  2. Configurar variables de entorno en Vercel (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
  3. Verificar build exitoso en Vercel
  4. Configurar dominio (puede ser el .vercel.app inicial)
  5. Actualizar CORS en Edge Functions con dominio de Vercel
- **Tiempo estimado:** 2-4 horas
- **Estado:** ⬜ Pendiente

### PC-005: Integrar Sentry para error tracking
- **Riesgo:** Sin observabilidad, cuando falle en producción no sabremos qué pasó
- **Qué hacer:**
  1. `npm install @sentry/nextjs` en frontend/
  2. Crear cuenta en sentry.io (plan free suficiente para empezar)
  3. Configurar `sentry.client.config.ts` y `sentry.server.config.ts`
  4. Agregar `NEXT_PUBLIC_SENTRY_DSN` a variables de entorno
  5. Verificar que errors de server components llegan a Sentry dashboard
- **Tiempo estimado:** 2 horas
- **Estado:** ⬜ Pendiente

### PC-006: Generar tipos TypeScript desde Supabase
- **Riesgo:** Tipos manuales en lib/supabase/types.ts se desincronizarán con la BD
- **Qué hacer:**
  1. `npx supabase gen types typescript --linked > frontend/lib/supabase/database.types.ts`
  2. Reemplazar imports de tipos manuales por los generados
  3. Agregar script al package.json: `"types:gen": "supabase gen types typescript --linked > lib/supabase/database.types.ts"`
  4. Documentar: correr este script después de cada migración
- **Tiempo estimado:** 3-4 horas
- **Estado:** ⬜ Pendiente

---

## IMPORTANTE — Para operar con confianza

### PC-007: Agregar headers de seguridad HTTP
- **Riesgo:** Sin CSP, X-Frame-Options, etc. hay vectores de ataque básicos abiertos
- **Qué hacer:** Agregar en `next.config.ts`:
  ```ts
  headers: async () => [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]
  }]
  ```
- **Tiempo estimado:** 30 minutos
- **Estado:** ⬜ Pendiente

### PC-008: Tests E2E del flujo crítico de conductor
- **Riesgo:** El flujo preoperacional → novedad es el core del producto. Cualquier regresión es grave
- **Qué hacer:**
  1. Instalar Playwright: `npm install -D @playwright/test`
  2. Test: conductor hace login → completa preoperacional → se crea novedad automáticamente
  3. Test: director ve la novedad recién creada
  4. Agregar al CI como gate de merge
- **Tiempo estimado:** 1 día
- **Estado:** ⬜ Pendiente

### PC-009: Separar ambiente de desarrollo y producción en Supabase
- **Riesgo:** Actualmente dev y prod son el mismo proyecto Supabase — un error en dev puede afectar datos de clientes
- **Qué hacer:**
  1. Crear segundo proyecto Supabase para producción
  2. Aplicar todas las migraciones al proyecto de producción
  3. Usar variables de entorno para apuntar a cada ambiente
  4. CI/CD usa proyecto dev; Vercel production usa proyecto prod
- **Tiempo estimado:** 4-6 horas
- **Estado:** ⬜ Pendiente

### PC-010: Validación de formularios con Zod
- **Riesgo:** Formularios con solo validación HTML básica pueden enviar datos malformados a Supabase
- **Qué hacer:**
  1. Instalar `zod` y `react-hook-form`
  2. Crear schemas Zod para entidades críticas: vehiculo, conductor, preoperacional
  3. Aplicar en formularios de creación/edición
- **Tiempo estimado:** 2-3 días
- **Estado:** ⬜ Pendiente

---

## MOBILE — Para cuando el producto tenga tracción

### PC-011: PWA para conductor
- **Riesgo:** Conductores en campo con mala conexión no pueden usar la web app
- **Qué hacer:**
  1. Agregar `manifest.json` con íconos y `theme_color`
  2. Implementar Service Worker con next-pwa
  3. Cache offline de la pantalla de preoperacional del día
  4. Push notifications para alertas de tareas
- **Tiempo estimado:** 1 semana
- **Estado:** ⬜ Pendiente — prioridad después de primer cliente real

---

## Completados

| ID | Ítem | Fecha | Notas |
|---|---|---|---|
| — | — | — | Ninguno completado aún |

---

## Log de decisiones sobre pendientes

| Fecha | Ítem | Decisión | Razón |
|---|---|---|---|
| 2026-06-28 | PC-001 a PC-010 | Identificados | Diagnóstico arquitectónico inicial |
