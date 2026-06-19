# 01 — Arquitectura del sistema

## Principio rector

La parte que determina si MyDrive es seguro y escalable —el modelo de datos y el
aislamiento de datos— vive en la capa más profunda del sistema (la base de datos),
no en el código de aplicación. El frontend es reemplazable; la arquitectura de datos
y seguridad es el activo.

## Vista de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENTES                                                     │
│                                                               │
│  App móvil (conductores)        Web (administradores)         │
│  Preoperacional + eventos       Tablero de gestión            │
│         │                              │                      │
└─────────┼──────────────────────────────┼─────────────────────┘
          │                              │
          │         HTTPS / TLS          │
          ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND  (Next.js — generado con v0, desplegado en Vercel) │
│  Renderizado, UI, sesión del usuario                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │  API segura + JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND  (Supabase)                                          │
│                                                               │
│  Auth          PostgreSQL          Storage     Edge Functions │
│  (roles, JWT)  (datos + RLS)       (fotos)     (lógica,       │
│                                                  notificac.)   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  ROW LEVEL SECURITY (el muro de aislamiento)         │     │
│  │  Toda consulta filtra por org → región → rol         │     │
│  │  ANTES de devolver una sola fila.                    │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Resend (correo)      │
                  │  Notificaciones        │
                  │  automáticas           │
                  └───────────────────────┘
```

## Decisiones de arquitectura (ADR resumidos)

### ADR-01 — Multi-tenant desde el día uno
El producto se vende a múltiples clientes. Cada cliente es una `organizacion`
(tenant). El aislamiento entre tenants es por `org_id` aplicado en RLS, no por
bases de datos separadas. Razón: menor costo operativo, escalable, y el aislamiento
a nivel de fila es defendible ante auditorías de seguridad.

### ADR-02 — Jerarquía organizacional de tres niveles
`organizacion → region → (vehiculos, usuarios)`. Un cliente como PMI opera por
regiones/sedes, cada una con su propio equipo. El alcance de cada usuario se define
por su `region_id`. Razón: un administrador de apoyo no debe ver datos de otra
región; esto es un requisito, no una mejora futura.

### ADR-03 — Seguridad en la capa de datos, no de aplicación
El aislamiento se aplica con Row Level Security de PostgreSQL. Una consulta mal
escrita en el frontend NO puede filtrar datos de otra organización o región, porque
la base de datos bloquea las filas antes de devolverlas. Razón: el aislamiento no
depende de que el programador no se equivoque en cada consulta.

### ADR-04 — Histórico inmutable (sin borrados)
Salidas de usuarios, ventas de vehículos y cambios de asignación se registran con
fechas (`hasta`), nunca con borrado de filas. Razón: trazabilidad total, requisito
para flota corporativa y auditoría.

### ADR-05 — Configuración sin código
Los ítems del preoperacional, tipos de evento y catálogos son datos, no código.
El administrador los modifica desde su panel. Razón: cumplir la promesa comercial
de "cambios rápidos y sin costo" sin convertirse en su equipo de desarrollo.

### ADR-06 — Frontend desacoplado
El frontend (v0/Next.js) consume el backend vía API. Puede regenerarse o
rediseñarse sin tocar la base de datos ni la seguridad. Razón: velocidad de
iteración en UI sin riesgo para los datos.

## Flujo de una novedad (el caso central)

1. Un conductor diligencia el preoperacional desde el móvil. Un ítem falla.
2. El backend crea una `novedad` ligada al vehículo y su región.
3. La novedad aparece en el tablero del administrador de **esa** región (RLS
   garantiza que solo esa región la vea).
4. El administrador la convierte en `tarea`, la asigna a un miembro de su equipo,
   define prioridad y fecha.
5. El responsable ejecuta; se registra un `mantenimiento`.
6. La tarea se cierra; todo queda en la hoja de vida del vehículo.

## Consideraciones de red corporativa

El cliente opera en redes corporativas estrictas. Implicaciones de diseño:

- Todo el tráfico sobre TLS.
- El backend (Supabase) y el frontend (Vercel) usan dominios estables que el área
  de TI del cliente puede incluir en sus listas de permitidos.
- La app móvil debe tolerar conectividad intermitente (modo offline para el
  preoperacional — ver roadmap, Fase 5).
- Auditoría de accesos (quién hizo qué y cuándo) — ver docs/04-seguridad.md.
