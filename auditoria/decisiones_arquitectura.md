# Decisiones de Arquitectura (ADRs) — MyDrive

Architecture Decision Records: por qué se eligió X sobre Y. Útil para no volver a debatir decisiones ya tomadas.

> Formato: **Estado** — Propuesta / Aceptada / Obsoleta / Reemplazada

---

## ADR-001: Next.js 16 App Router como framework frontend
- **Estado:** Aceptada
- **Fecha:** ~2026-05 (inicio del proyecto)
- **Contexto:** Necesitamos un framework que soporte SSR para la vista de director/admin (datos en servidor), y CSR para formularios interactivos de conductores.
- **Decisión:** Next.js 16 con App Router. Server Components para páginas de datos, Client Components para formularios.
- **Razones:** SSR nativo reduce carga en cliente; App Router soporta layouts anidados necesarios para dashboard + conductor; ecosistema maduro; despliegue fácil en Vercel.
- **Alternativas descartadas:** Remix (menor ecosistema en LATAM), SvelteKit (menor adopción para escalar equipo), CRA (sin SSR).
- **Consecuencias:** Requiere entender la distinción server/client component. Algunos bugs de hidratación posibles.

---

## ADR-002: Supabase como BaaS (Backend-as-a-Service)
- **Estado:** Aceptada
- **Fecha:** ~2026-05
- **Contexto:** Proyecto de 1 developer. Necesita auth, BD, storage, y edge functions sin overhead de infraestructura.
- **Decisión:** Supabase con PostgreSQL 15, Auth, Storage y Edge Functions (Deno).
- **Razones:** PostgreSQL es la BD correcta para datos relacionales complejos (flota vehicular tiene muchas relaciones); RLS nativo de Postgres es el mejor mecanismo de aislamiento multi-tenant disponible; precio razonable para SaaS; SDK oficial para Next.js/SSR.
- **Alternativas descartadas:** Firebase (no relacional, RLS más débil), PlanetScale (sin RLS), NestJS + Postgres propio (requiere más infra y devops).
- **Consecuencias:** Vendor lock-in en Supabase. Si se necesita migrar, el RLS es portable a cualquier PostgreSQL pero las Edge Functions y Auth requerirían reescritura.

---

## ADR-003: RLS de 3 niveles para aislamiento multi-tenant
- **Estado:** Aceptada
- **Fecha:** ~2026-05 / refinado en migraciones 08-13
- **Contexto:** MyDrive es multi-tenant. Un tenant no puede ver datos de otro. Dentro de un tenant, los roles tienen distintos alcances de visibilidad.
- **Decisión:** RLS con 3 niveles: `org_id` (aislamiento entre tenants) → `region_id` (aislamiento dentro del tenant por sede) → `rol` (permisos de acción por tipo de usuario).
- **Razones:** El RLS de PostgreSQL es la capa más segura porque opera en la BD, no en la aplicación. Aunque el frontend tenga un bug, los datos están protegidos.
- **Implementación:**
  - Funciones de contexto SECURITY DEFINER que leen el `auth.uid()` de Supabase
  - Trigger `fn_ctx_org()` que rellena automáticamente `org_id` en INSERT
  - Funciones auxiliares SECURITY DEFINER para subqueries cross-table (para evitar recursión infinita)
- **Consecuencias:** Complejidad en migraciones. Debugging de RLS es difícil (los errores de recursión son crípticos). Requiere funciones SECURITY DEFINER para cualquier policy que haga JOIN.

---

## ADR-004: Funciones SECURITY DEFINER para subqueries en RLS
- **Estado:** Aceptada
- **Fecha:** 2026-06 (migraciones 11 y 12)
- **Contexto:** Las políticas RLS de `vehiculo` y `asignacion` se referenciaban mutuamente causando `infinite recursion detected in policy`.
- **Decisión:** Toda policy que necesite hacer subquery a otra tabla DEBE usar una función SECURITY DEFINER que encapsule esa consulta.
- **Razones:** Las funciones SECURITY DEFINER se ejecutan con permisos del propietario (postgres), no del usuario que hace la query. Esto rompe el ciclo de recursión porque la función interna no activa las políticas RLS de la tabla que consulta.
- **Consecuencias:** Mayor número de funciones en la BD. Cada función debe ser auditada para no filtrar datos. El patrón es conocido y funciona — no desviarse de él.

---

## ADR-005: Trigger auto-org_id en INSERT
- **Estado:** Aceptada
- **Fecha:** 2026-06 (migración 10)
- **Contexto:** Cada fila en 14 tablas debe tener `org_id` correcto. Si el frontend lo envía, puede equivocarse o ser manipulado.
- **Decisión:** Trigger BEFORE INSERT `fn_ctx_org()` que rellena `org_id` desde la sesión de auth, ignorando cualquier valor que envíe el cliente.
- **Razones:** Simplifica el frontend (no necesita conocer el org_id); elimina un vector de ataque (un usuario no puede especificar org_id de otro tenant); consistencia garantizada.
- **Consecuencias:** Los servicios frontend NO deben enviar `org_id` en INSERTs. Si se envía, el trigger lo sobreescribe de todas formas, pero es código innecesario.

---

## ADR-006: Patrón page.tsx thin wrapper
- **Estado:** Aceptada
- **Fecha:** ~2026-05
- **Contexto:** Cada ruta protegida necesita verificar autenticación y rol antes de renderizar.
- **Decisión:** `page.tsx` solo hace: get user → check auth → check rol → render feature component. Toda la lógica de datos y UI va en el Feature Component.
- **Razones:** Separación de responsabilidades. Facilita testing (el feature component puede testarse sin auth). Reduce duplicación de auth logic dispersa en componentes.
- **Consecuencias:** Hasta que se implemente `middleware.ts`, cada `page.tsx` debe incluir su propio check. Riesgo de olvidar el check en páginas nuevas.

---

## ADR-007: Recharts para gráficos del dashboard
- **Estado:** Aceptada — revisable
- **Fecha:** ~2026-06
- **Contexto:** El dashboard de director y admin necesita gráficos: donut de estado de flota, área de km acumulados, barras de mantenimientos.
- **Decisión:** Recharts (React + D3 based).
- **Razones:** Documentación clara, componentes declarativos, integración natural con React.
- **Alternativas:** Tremor (más opinionado, menos flexible), Chart.js (más ligero pero menos React-native), Victory.
- **Revisión recomendada:** Recharts tiene bundle grande (~200KB). Si el dashboard se vuelve crítico en performance, evaluar migración a Tremor o componentes SVG propios.
- **Consecuencias:** Bundle más grande. Acceptable para MVP.

---

## ADR-008: Supabase SSR para manejo de sesión
- **Estado:** Aceptada
- **Fecha:** ~2026-05
- **Contexto:** Next.js App Router necesita que la sesión de Supabase esté disponible tanto en Server Components como en Client Components.
- **Decisión:** `@supabase/ssr` con cookies para sincronizar sesión entre cliente y servidor.
- **Razones:** Es el patrón oficial de Supabase para Next.js App Router. Evita el problema de hidratación de sesión.
- **Consecuencias:** `createClient()` en servidor es async (await cookies()). `createClient()` en cliente es sync. Son dos funciones distintas en `lib/supabase/server.ts` y `lib/supabase/client.ts`.
