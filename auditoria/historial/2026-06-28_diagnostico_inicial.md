# 2026-06-28 — Diagnóstico Arquitectónico Inicial

## Contexto
Primera auditoría formal del proyecto. Análisis como arquitecto de soluciones con perspectiva de escala (Rappi, Airbnb, Didi, Uber).

## Estado del proyecto en esta fecha
- 13 migraciones SQL aplicadas en Supabase
- ~50 pages en App Router (director + admin + conductor + superadmin)
- 16 servicios en lib/services/
- 2 Edge Functions desplegadas (crear-novedad, notificar-evento)
- CI en GitHub Actions (lint + build)
- Sin deployment en Vercel
- Sin tests de ningún tipo
- Sin observabilidad

## Hallazgos principales

### Fortalezas confirmadas
- Base de datos y RLS multi-tenant: arquitectura sólida y madura
- Trigger auto org_id: elegante y seguro
- Funciones SECURITY DEFINER para romper recursión RLS: patrón correcto
- Separación de capas frontend: page → feature → service
- Error boundaries y loading states en módulos principales

### Brechas críticas descubiertas
1. `SUPABASE_SERVICE_ROLE_KEY` commiteado en git (R-001) — URGENTE
2. Sin `middleware.ts` — control de acceso disperso (R-006)
3. 0 tests de ningún tipo (R-002)
4. Sin observabilidad — Sentry no integrado (R-003)
5. No desplegado en ningún ambiente público (PC-004)
6. Tipos TypeScript manuales, no generados desde BD (R-005)
7. Un solo proyecto Supabase para dev y prod (R-004)
8. Conductor sin capacidades mobile-first reales (R-007)

## Veredicto
**Listo para piloto interno con cliente conocido y supervisado. NO listo para producción general.**

El síndrome de alucinación de producción existe pero es parcial: la BD está sólida, el frontend está funcionalmente completo, pero el sistema operativo (tests, observabilidad, deployment, seguridad de credenciales) no existe.

## Próximos pasos recomendados
Ver `pendientes_criticos.md` — priorizar PC-001 (rotar keys) como primer paso.

## Participantes
- Elvis Pérez (fundador, full-stack)
- Claude Code (arquitecto de sesión)
