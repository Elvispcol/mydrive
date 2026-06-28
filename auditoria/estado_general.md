# Estado General del Proyecto — MyDrive

> Última actualización: 2026-06-28

## Leyenda
- ✅ Completado y funcional
- ⚠️ Parcial o con deuda técnica conocida
- 🔴 Crítico — bloqueante para producción real
- ⬜ Pendiente — no iniciado

---

## BASE DE DATOS

| Ítem | Estado | Notas |
|---|---|---|
| Esquema 22 tablas | ✅ | 13 migraciones aplicadas en Supabase |
| RLS multi-tenant (org → región → rol) | ✅ | Funciones SECURITY DEFINER para romper recursión |
| Triggers auto org_id | ✅ | fn_ctx_org() en 14 tablas — migración 10 |
| Funciones de contexto | ✅ | mydrive_org_id, mydrive_rol, mydrive_region_id, etc. |
| Tipos TypeScript desde BD | 🔴 | Tipos manuales — debe ser `supabase gen types typescript` |
| Soft-delete en tablas críticas | ⚠️ | Solo novedad y vehiculo tienen eliminado_en |
| Índices de performance | ⚠️ | Migración 05 agrega algunos, no auditados completamente |
| Backup automático | ✅ | Supabase Pro incluye Point-in-Time Recovery (activar en prod) |

---

## SEGURIDAD

| Ítem | Estado | Notas |
|---|---|---|
| RLS activo en todas las tablas | ✅ | Verificado en migraciones |
| Credenciales en .gitignore | 🔴 | `.env.local` fue commiteado — ROTAR KEYS |
| Middleware de protección de rutas | 🔴 | No existe middleware.ts |
| CORS en Edge Functions | ✅ | Whitelist de dominios configurada |
| Rate limiting Edge Functions | ✅ | 20 req/min crear-novedad, 10 req/min notificar-evento |
| SERVICE_ROLE_KEY solo en servidor | 🔴 | Expuesto en git history — requiere rotación |
| Validación de inputs (server-side) | ⚠️ | Solo validación básica en API route usuarios |
| Headers de seguridad HTTP | ⬜ | Sin next.config headers (X-Frame-Options, CSP, etc.) |

---

## FRONTEND

| Ítem | Estado | Notas |
|---|---|---|
| Director — 12 módulos | ✅ | Dashboard, vehículos, conductores, multas, combustible, checklist, preop, novedades, tareas, mantenimientos, usuarios, regiones |
| Admin Apoyo — 10 módulos | ✅ | Mismos excepto usuarios/regiones |
| Conductor — 3 módulos | ✅ | Home preoperacional, historial, perfil |
| Superadmin — organizaciones | ✅ | Lista con toggle activo/inactivo |
| Error boundaries | ⚠️ | Solo 3 (admin, conductor, director) — sin detalles de error útiles |
| Loading states (skeleton) | ✅ | loading.tsx en módulos principales |
| Middleware de auth | 🔴 | No existe — control disperso en cada page.tsx |
| TypeScript estricto | ⚠️ | Tipos manuales, no generados desde BD |
| Validación de formularios | ⚠️ | Sin zod/react-hook-form — validación HTML básica |
| Accesibilidad (a11y) | ⬜ | No evaluado |
| Internacionalización | ⚠️ | Estructura [locale] lista, solo español implementado |

---

## TESTING

| Ítem | Estado | Notas |
|---|---|---|
| Tests unitarios | 🔴 | 0 tests — no existe framework configurado |
| Tests de integración | 🔴 | 0 tests |
| Tests E2E | 🔴 | 0 tests — sin Playwright ni Cypress |
| Tests de RLS (seguridad) | 🔴 | Sin verificación automatizada de aislamiento |
| CI gate de tests | 🔴 | CI solo hace lint + build |

---

## INFRAESTRUCTURA Y DEPLOYMENT

| Ítem | Estado | Notas |
|---|---|---|
| Repositorio GitHub | ✅ | github.com/Elvispcol/mydrive — rama main |
| CI/CD GitHub Actions | ⚠️ | Lint + build solamente — sin tests ni deploy |
| Deployment Vercel | 🔴 | No configurado — solo corre en localhost:3000 |
| Dominio propio | ⬜ | Pendiente |
| Variables de entorno en Vercel | 🔴 | No configuradas |
| Supabase proyecto de producción | ⚠️ | Un solo proyecto (dev = prod) — riesgo |
| Supabase proyecto de staging | ⬜ | No existe ambiente separado |
| Edge Functions desplegadas | ✅ | crear-novedad, notificar-evento en Supabase |
| Resend (email) configurado | ⚠️ | API key en .env pero no verificado en producción |

---

## OBSERVABILIDAD

| Ítem | Estado | Notas |
|---|---|---|
| Sentry (error tracking) | 🔴 | No integrado |
| Logging centralizado | 🔴 | No existe — console.log disperso |
| Métricas de performance | ⬜ | Sin Web Vitals ni APM |
| Alertas de disponibilidad | ⬜ | Sin uptime monitoring |
| Dashboard de uso | ⬜ | Sin analytics de producto |

---

## MOBILE

| Ítem | Estado | Notas |
|---|---|---|
| App móvil nativa | ⬜ | No existe — roadmap futuro |
| PWA para conductor | ⬜ | Web app responsive pero sin manifest ni service worker |
| Offline-first para conductor | ⬜ | Sin soporte offline |
| Push notifications | ⬜ | No implementado |
| Acceso a cámara (eventos) | ⬜ | Sin API de cámara integrada |

---

## RESUMEN EJECUTIVO

```
Base de datos:      ████████░░  80%  — Sólida, falta tipos generados y auditoría de índices
Seguridad:          ████░░░░░░  40%  — CRÍTICO: credenciales expuestas, sin middleware
Frontend:           ███████░░░  70%  — Módulos completos, sin testing ni validación robusta
Testing:            ░░░░░░░░░░   0%  — BLOQUEANTE para producción
Deployment:         ██░░░░░░░░  20%  — Solo CI parcial, sin Vercel
Observabilidad:     ░░░░░░░░░░   0%  — Ciego en producción
Mobile:             ░░░░░░░░░░   0%  — No iniciado

LISTO PARA PRODUCCIÓN: NO
LISTO PARA PILOTO INTERNO: SÍ (con cliente conocido y supervisado)
```
