# 07 — Gestión del proyecto

## Estructura de trabajo

MyDrive se desarrolla como producto propio bajo un monorepo. El backend, la base de
datos y la documentación viven juntos; el frontend (v0) es una carpeta/repositorio
hermana que consume este backend.

## Convenciones de Git

### Ramas
- `main` — estable, siempre desplegable.
- `dev` — integración del trabajo en curso.
- `feat/<nombre>` — una funcionalidad concreta.
- `fix/<nombre>` — corrección.

### Mensajes de commit (Conventional Commits)
```
feat: agregar tabla de mantenimientos
fix: corregir política RLS de tareas
docs: documentar roles y permisos
chore: configurar CI
```

## Convenciones de base de datos

- Migraciones numeradas en orden en `db/migrations/`. Nunca editar una migración ya
  aplicada; crear una nueva.
- Políticas RLS en `db/policies/`, separadas del esquema para revisarlas como una
  unidad de seguridad.
- Nombres de tablas y columnas en español, en `snake_case`, singular para tablas
  (`vehiculo`, no `vehiculos`).
- Toda tabla con datos de cliente lleva `org_id` y tiene RLS habilitado. Sin
  excepción.

## Flujo de desarrollo recomendado

1. La base (este repositorio) se lleva a la máquina local.
2. **Claude Code** se usa como copiloto de backend: aplica migraciones a Supabase,
   crea Edge Functions, itera sobre la lógica de servidor.
3. **v0** genera y itera el frontend, consumiendo el backend.
4. Los cambios se integran vía ramas y se despliegan desde `main`.

## Definición de "terminado" (Definition of Done)

Una funcionalidad está terminada cuando:
- El esquema y las políticas RLS están en `db/` y validados.
- La lógica sensible vive en el servidor (no en el cliente).
- La documentación afectada está actualizada.
- No introduce datos personales sin su política de acceso correspondiente.

## Tablero de tareas

Para la gestión del desarrollo se recomienda un tablero simple (GitHub Projects o
similar) con columnas: Backlog → En progreso → Revisión → Hecho. Las fases del
roadmap (docs/06-roadmap.md) son los épicos; cada módulo es una tarjeta.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Desarrollador único como cuello de botella | Configuración sin código; arquitectura documentada para onboarding |
| Incidente de seguridad con datos personales | RLS en capa de datos, auditoría, minimización, asesoría legal |
| Cliente pide cambios ilimitados gratis | Distinción clara: configuración = gratis; módulos nuevos = proyecto aparte |
| Costo de infraestructura crece con volumen | Rangos de operación por tier, definidos internamente |
| Conectividad en campo | Modo offline planificado (Fase 5) |
