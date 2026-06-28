# Auditoría de Proyecto — MyDrive

Carpeta de auditoría viva. Se actualiza cada vez que se completa un ítem, se descubre un riesgo nuevo, o se toma una decisión arquitectónica relevante.

## Cómo usar esta carpeta

1. **Antes de empezar una sesión de trabajo** → revisar `pendientes_criticos.md`
2. **Al completar una práctica** → mover de `pendientes` a `completado` en `estado_general.md` con fecha
3. **Al descubrir un riesgo nuevo** → agregar entrada en `riesgos.md`
4. **Al tomar una decisión de arquitectura** → registrar en `decisiones_arquitectura.md`
5. **Al finalizar un sprint o bloque de trabajo** → agregar entrada en `historial/`

## Archivos

| Archivo | Propósito |
|---|---|
| `estado_general.md` | Dashboard de estado del proyecto — qué está listo, qué falta |
| `pendientes_criticos.md` | Ítems que DEBEN resolverse antes de tener clientes reales |
| `buenas_practicas.md` | Patrones y convenciones establecidas — no reinventar |
| `riesgos.md` | Riesgos identificados con probabilidad e impacto |
| `decisiones_arquitectura.md` | ADRs (Architecture Decision Records) — por qué se decidió X |
| `historial/` | Log cronológico de avances — una entrada por sesión o sprint |

## Regla de oro

> Si algo se decidió en conversación pero no está escrito aquí, no existe.

Todo patrón, restricción, riesgo o decisión importante que surja en el desarrollo va a este directorio. Así no se pierde el contexto entre sesiones y se evita repetir errores.
