# Mantenimiento Mensual — MyDrive

Plantilla de ejecución para el primer lunes de cada mes. El Arquitecto (AG-00) lidera. Copiar esta plantilla en `historial/YYYY-MM_mantenimiento.md` al ejecutar.

---

## Plantilla de Reporte Mensual

```markdown
# Mantenimiento Mensual — [MES] [AÑO]

**Fecha de ejecución:** YYYY-MM-DD
**Ejecutado por:** Arquitecto Jefe (Claude Code) + Elvis Pérez
**Duración estimada:** 2-3 horas

---

## 1. SALUD DEL SISTEMA (AG-06)

### Errores en Sentry (últimos 30 días)
- Total de errores únicos: ___
- Error más frecuente: ___ (N ocurrencias)
- Módulos más afectados: ___
- Errores críticos (500 en producción): ___

### Uptime
- Disponibilidad: ___% (objetivo: >99.5%)
- Incidentes registrados: ___
- Tiempo total de caída: ___ minutos

### Performance
- Ruta más lenta: ___ (___ms promedio)
- LCP promedio: ___ms (objetivo: <2500ms)
- Rutas con problemas de performance: ___

### Estado: [ ] Verde [ ] Amarillo [ ] Rojo

---

## 2. SEGURIDAD (AG-03)

### Dependencias
- Ejecutado `npm audit`: ___ vulnerabilidades (High: ___, Critical: ___)
- Paquetes desactualizados con CVE: ___
- Acción tomada: ___

### Credenciales
- `.env.local` en repo: [ ] No (correcto) [ ] Sí (ALERTA)
- Keys sin rotar hace >90 días: ___
- Última rotación de SUPABASE keys: ___

### Accesos Supabase (últimos 30 días)
- Picos inusuales de requests: ___
- IPs desconocidas: ___
- Errores de RLS (policy violations): ___

### Estado: [ ] Verde [ ] Amarillo [ ] Rojo

---

## 3. BASE DE DATOS (AG-01)

### Crecimiento de datos
| Tabla | Filas actuales | Crecimiento del mes | Proyección 12 meses |
|---|---|---|---|
| organizacion | | | |
| usuario | | | |
| vehiculo | | | |
| preoperacional | | | |
| novedad | | | |
| combustible | | | |
| multa_infraccion | | | |

### Performance de queries
- Queries lentos (>500ms) detectados: ___
- Índices faltantes identificados: ___
- Acción tomada: ___

### Migraciones del mes
- Migraciones aplicadas: ___
- Próximas migraciones planeadas: ___

### Estado: [ ] Verde [ ] Amarillo [ ] Rojo

---

## 4. FRONTEND / PRODUCTO (AG-02)

### Uso por módulo (si hay analytics)
- Módulo más usado: ___
- Módulo menos usado: ___
- Features sin uso en 30 días: ___

### Deuda técnica identificada
- ___
- ___

### Estado: [ ] Verde [ ] Amarillo [ ] Rojo

---

## 5. DEPLOYMENT / CI (AG-05)

### CI/CD
- Builds fallidos en el mes: ___
- Tiempo promedio de build: ___ min
- Deployments a producción: ___

### Versión actual
- Next.js: ___
- Supabase JS: ___
- Última actualización de dependencias: ___

### Estado: [ ] Verde [ ] Amarillo [ ] Rojo

---

## 6. TENANTS / CLIENTES

| Cliente | Fecha onboarding | Plan | Usuarios activos | Issues del mes |
|---|---|---|---|---|
| Porciento Trading (demo) | — | — | — | — |

---

## 7. DECISIONES Y ACCIONES DEL MES

### Riesgos mitigados este mes
- ___

### Nuevos riesgos identificados
- ___

### Pendientes completados este mes
- ___

### Pendientes nuevos para el próximo mes (top 3)
1. ___
2. ___
3. ___

---

## 8. ESTADO CONSOLIDADO

| Área | Estado | Tendencia |
|---|---|---|
| Salud del sistema | | ↑ ↓ → |
| Seguridad | | ↑ ↓ → |
| Base de datos | | ↑ ↓ → |
| Frontend / Producto | | ↑ ↓ → |
| Deployment / CI | | ↑ ↓ → |
| Cobertura de tests | | ↑ ↓ → |

**Veredicto del mes:** [ ] El proyecto avanza bien [ ] Hay deuda técnica acumulándose [ ] Requiere sprint de correcciones
```

---

## Calendario de mantenimiento

| Mes | Fecha objetivo | Estado | Enlace al reporte |
|---|---|---|---|
| Julio 2026 | 2026-07-06 | ⬜ Pendiente | — |
| Agosto 2026 | 2026-08-03 | ⬜ Pendiente | — |
| Septiembre 2026 | 2026-09-07 | ⬜ Pendiente | — |
| Octubre 2026 | 2026-10-05 | ⬜ Pendiente | — |
| Noviembre 2026 | 2026-11-02 | ⬜ Pendiente | — |
| Diciembre 2026 | 2026-12-07 | ⬜ Pendiente | — |

---

## Umbrales de alerta

### Verde — todo bien
- Uptime >99.5%
- 0 errores críticos en Sentry
- 0 vulnerabilidades High/Critical en npm audit
- Build time <5 min
- 0 queries >500ms

### Amarillo — atención requerida
- Uptime 98-99.5%
- 1-5 errores críticos en Sentry (recurrentes)
- Vulnerabilidades Medium en npm audit sin CVE explotado
- Build time 5-10 min
- Queries entre 500ms-1s

### Rojo — acción urgente esta semana
- Uptime <98%
- >5 errores críticos en Sentry O 1 error que afecta a todos los usuarios
- Vulnerabilidades High/Critical en npm audit
- Build time >10 min o builds fallando >30% de las veces
- Queries >1s en flujos críticos (preoperacional, dashboard)
