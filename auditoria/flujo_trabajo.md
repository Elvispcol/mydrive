# Flujo de Trabajo — MyDrive

Cómo se trabaja en este proyecto desde una sesión de desarrollo hasta el mantenimiento mensual. El Arquitecto Jefe (Claude Code) lidera cada flujo.

---

## Flujo 1: Inicio de Sesión de Trabajo

Cada vez que Elvis abre una nueva sesión con Claude Code, el Arquitecto sigue este protocolo:

```
1. LEER auditoria/estado_general.md       → ¿qué cambió? ¿hay nuevos ✅ o 🔴?
2. LEER auditoria/pendientes_criticos.md  → ¿qué está urgente?
3. LEER auditoria/riesgos.md              → ¿algún riesgo nuevo o empeorado?
4. PREGUNTAR a Elvis: ¿qué trabajamos hoy?
5. CLASIFICAR la tarea → seleccionar agente de la matriz de delegación
6. EJECUTAR con el agente correspondiente
7. ACTUALIZAR auditoría al finalizar
```

**Tiempo estimado del protocolo de arranque:** 2-3 minutos

---

## Flujo 2: Nueva Feature o Módulo

```
Elvis describe la feature
       ↓
Arquitecto (AG-00) evalúa:
  ¿Requiere cambio de BD? → AG-01 primero
  ¿Solo frontend? → AG-02 directamente
  ¿Toca auth/seguridad? → AG-03 en paralelo
       ↓
AG-01 (si aplica): diseña migración SQL + RLS
       ↓
Arquitecto revisa la migración (ADR si es decisión importante)
       ↓
AG-01 aplica migración: npx supabase db push --linked
       ↓
AG-01 regenera tipos: supabase gen types typescript --linked
       ↓
AG-02 implementa el módulo (page → feature → service)
       ↓
AG-03 revisa que no haya credenciales expuestas, que RLS esté activo
       ↓
Arquitecto hace revisión final
       ↓
AG-04 agrega test E2E si es flujo crítico
       ↓
git commit → push → CI verde → merge a main
       ↓
Arquitecto actualiza auditoria/estado_general.md
```

---

## Flujo 3: Bug Reportado por Usuario

```
Elvis reporta: "X no funciona"
       ↓
Arquitecto (AG-00) hace triage:
  ¿Error de BD/RLS? → AG-01
  ¿Error de UI/frontend? → AG-02
  ¿Error de seguridad? → AG-03
  ¿Error desconocido sin contexto? → AG-06 revisa Sentry logs
       ↓
Agente identifica causa raíz
       ↓
Agente propone fix → Arquitecto aprueba
       ↓
Fix implementado y testeado
       ↓
AG-04 agrega test de regresión para que no vuelva a ocurrir
       ↓
git commit → push → CI → merge
       ↓
Arquitecto agrega entrada en auditoria/historial/FECHA_bug_nombre.md
```

---

## Flujo 4: Sprint Semanal (cuando hay múltiples tareas)

**Lunes:**
- Arquitecto revisa auditoría completa
- Prioriza pendientes de la semana (máx 3 ítems)
- Define qué agentes se activan

**Durante la semana:**
- Cada tarea sigue el Flujo 2 o 3 según aplique
- El Arquitecto actualiza `estado_general.md` al terminar cada ítem

**Viernes:**
- Arquitecto hace revisión de la semana
- Agrega entrada en `historial/YYYY-MM-DD_semana.md`
- Actualiza estados en `pendientes_criticos.md`
- Identifica si hay nuevos riesgos → agregar a `riesgos.md`

---

## Flujo 5: Release a Producción

Aplicar cada vez que se va a hacer deploy de una nueva versión a usuarios reales.

```
Pre-release checklist (AG-03 + AG-00):
  ✅ CI verde en main
  ✅ Tests E2E pasando
  ✅ Sin credenciales en git (git log --all -- '*.env*' muestra nada)
  ✅ Variables de entorno actualizadas en Vercel
  ✅ Supabase migraciones al día (supabase db push --linked)
  ✅ Edge Functions desplegadas
  ✅ Sentry configurado y capturando

Deploy:
  AG-05 hace push a Vercel (automático si CI conectado)
  AG-06 monitorea Sentry los primeros 30 min
  Arquitecto hace smoke test manual de los flujos críticos

Post-release:
  Arquitecto agrega entrada en historial/YYYY-MM-DD_release_vX.X.md
  Actualiza auditoria/estado_general.md con fecha de deployment
```

---

## Flujo 6: Mantenimiento Mensual

**Ejecutar el primer lunes de cada mes.**

### Semana 1 del mes — Revisión de salud

```
AG-06 (Observabilidad):
  - Revisar Sentry: errores del mes, frecuencia, módulos afectados
  - Revisar uptime: ¿hubo caídas?
  - Revisar performance: ¿hay rutas lentas (>2s)?
  - Generar reporte breve → auditoria/historial/YYYY-MM_health_report.md

AG-03 (Seguridad):
  - Revisar si hay dependencias con vulnerabilidades: npm audit
  - Verificar que .env.local sigue excluido del repo
  - Revisar logs de acceso en Supabase (últimos 30 días)
  - ¿Hay nuevas keys o secrets sin rotar?

AG-01 (Base de datos):
  - Revisar tamaño de tablas principales (¿crecimiento esperado?)
  - Verificar índices (¿queries lentos en Supabase logs?)
  - Backup verificado (¿Supabase Pro tiene PITR activo?)

Arquitecto (AG-00):
  - Leer los 3 reportes anteriores
  - Actualizar auditoria/riesgos.md (mitigar los resueltos, agregar nuevos)
  - Actualizar auditoria/estado_general.md
  - Actualizar auditoria/pendientes_criticos.md (completar los hechos)
  - Definir prioridades del mes siguiente
```

### Semana 2-4 del mes — Ejecución

Trabajar los pendientes priorizados siguiendo los flujos de feature o bug según corresponda.

---

## Flujo 7: Nuevo Tenant (Onboarding de cliente)

```
AG-03 verifica que el RLS aísla correctamente:
  - Crear org en tabla organizacion
  - Crear director inicial en auth + tabla usuario con org_id correcto
  - Verificar que el director ve SOLO sus datos
  - Verificar que NO puede ver datos de otro tenant

AG-02 crea datos de demostración si el cliente lo solicita:
  - Adaptar seed_demo_pm.sql al nuevo tenant
  - Aplicar datos de muestra para onboarding

AG-00 documenta el onboarding:
  - auditoria/historial/YYYY-MM-DD_onboarding_NombreCliente.md
  - Registro del plan_licencia, fecha de inicio, contacto
```

---

## Reglas del flujo

1. **Ningún trabajo llega a main sin revisión del Arquitecto (AG-00).** Sin excepciones.
2. **Ninguna migración SQL se aplica sin leer el diff completo.** DROP TABLE siempre requiere confirmación de Elvis.
3. **Ningún secreto o credencial se toca sin AG-03 presente.**
4. **La auditoría se actualiza al finalizar cada sesión.** No al día siguiente.
5. **Un bug sin test de regresión no está cerrado.** Está pospuesto.
6. **Si AG-04 no existe aún (0 tests), el Arquitecto documenta el flujo crítico afectado** para que cuando se instale el framework de testing, ese sea el primer test a escribir.
