# Auditoría de Proyecto — MyDrive

Sistema de control arquitectónico vivo. Liderado por el **Arquitecto Jefe (Claude Code AG-00)**. Se actualiza en cada sesión de trabajo y en el mantenimiento mensual.

> Si algo se decidió en conversación pero no está escrito aquí, no existe.

---

## El equipo

| ID | Agente | Rol | Estado |
|---|---|---|---|
| AG-00 | Arquitecto Jefe | Visión, coordinación, auditoría, ADRs | ✅ Activo |
| AG-01 | Data Architect | Migraciones SQL, RLS, tipos, performance BD | ✅ Activo |
| AG-02 | Frontend Engineer | Next.js, App Router, UI, formularios | ✅ Activo |
| AG-03 | Security Auditor | Credenciales, middleware, headers, RLS audit | ✅ Activo |
| AG-04 | QA Engineer | Tests E2E, integración, regresiones, CI gate | ⚠️ Pendiente setup |
| AG-05 | DevOps Engineer | Vercel, CI/CD, ambientes, dominios | ⚠️ Pendiente setup |
| AG-06 | Observability Engineer | Sentry, logs, alertas, uptime | ⚠️ Pendiente setup |
| AG-07 | Mobile Engineer | PWA, offline, cámara, push notifications | 💤 En espera (post primer cliente) |

---

## Archivos de la auditoría

| Archivo | Propósito | Quién actualiza | Frecuencia |
|---|---|---|---|
| `estado_general.md` | Dashboard de estado por área | AG-00 | Cada sesión |
| `pendientes_criticos.md` | Ítems bloqueantes priorizados | AG-00 | Al completar o descubrir |
| `buenas_practicas.md` | Patrones y convenciones activas | AG-00 / agente especialista | Al establecer o cambiar patrón |
| `riesgos.md` | Registro de riesgos activos | AG-00 | Al identificar o mitigar |
| `decisiones_arquitectura.md` | ADRs — por qué se decidió X | AG-00 | Al tomar decisión importante |
| `equipo_agentes.md` | Roles, responsabilidades, checklists del equipo | AG-00 | Al cambiar el equipo |
| `flujo_trabajo.md` | Protocolos de trabajo (feature, bug, release, mensual) | AG-00 | Al refinar el proceso |
| `mantenimiento_mensual.md` | Plantilla y calendario de mantenimiento | AG-00 | Al completar cada mes |
| `historial/` | Log cronológico de sesiones y reportes | AG-00 | Al finalizar cada sesión |

---

## Protocolo de arranque (cada sesión)

El Arquitecto Jefe ejecuta esto antes de cualquier tarea:

```
1. Leer estado_general.md        → ¿qué cambió?
2. Leer pendientes_criticos.md   → ¿qué está urgente?
3. Leer riesgos.md               → ¿hay riesgos nuevos?
4. Preguntar a Elvis: ¿qué trabajamos hoy?
5. Clasificar tarea → delegar al agente correcto
6. Ejecutar
7. Actualizar auditoría al terminar
```

---

## Ciclo de vida del proyecto

```
Sesión de trabajo
    ↓
Sprint semanal (lunes → viernes)
    ↓
Mantenimiento mensual (primer lunes del mes)
    ↓
Release a producción (cuando esté listo)
    ↓
Onboarding de nuevo tenant
    ↓
Mantenimiento mensual (continúa)
```

Ver `flujo_trabajo.md` para el detalle de cada flujo.

---

## Estado rápido del proyecto

> Última actualización: 2026-06-28

```
Base de datos:      ████████░░  80%
Seguridad:          ████░░░░░░  40%  ← CRÍTICO: keys expuestas, sin middleware
Frontend:           ███████░░░  70%
Testing:            ░░░░░░░░░░   0%  ← BLOQUEANTE
Deployment:         ██░░░░░░░░  20%
Observabilidad:     ░░░░░░░░░░   0%  ← BLOQUEANTE
Mobile:             ░░░░░░░░░░   0%

LISTO PARA PRODUCCIÓN: NO
LISTO PARA PILOTO INTERNO: SÍ
```

Ver `estado_general.md` para el detalle completo.
