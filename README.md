# MyDrive

Plataforma de gestión integral de flota vehicular corporativa.

MyDrive no es un sistema de formularios: es el centro de control del administrador
de flota. El preoperacional diario y los reportes de eventos de los conductores son
las señales que alimentan la gestión real — administración del parque automotor,
delegación de tareas al equipo, y cierre de novedades de extremo a extremo.

## El problema que resuelve

Los sistemas actuales (tipo Traxall) venden **captura**: que los conductores
diligencien formularios. Dejan al administrador de flota solo con el caos de la
gestión — Excel paralelo, reprocesos, cosas que se olvidan, imposibilidad de
delegar. MyDrive vende **administración**: control total de la operación.

### La cadena de valor

Un conductor reporta en su preoperacional que los frenos fallan. En un sistema
tradicional, eso llega como un correo y muere. En MyDrive:

```
Preoperacional con falla
      ↓
  Novedad (entra al tablero del administrador de la región)
      ↓
  Tarea (el administrador la delega a su equipo, con prioridad y seguimiento)
      ↓
  Mantenimiento (se ejecuta y se cierra)
      ↓
  Hoja de vida del vehículo (queda registrado para siempre)
```

Esa trazabilidad por región, con responsables y estados, es el producto.

## Modelo de negocio

- **Producto propio bajo licencia.** El cliente paga por usar MyDrive; el software
  es de Porciento Trading.
- **Precio por profundidad, no por volumen.** El cliente paga por las capacidades
  (tiers de funcionalidad), nunca por cantidad de vehículos. Internamente se definen
  rangos de operación por tier para proteger el margen de infraestructura.
- **Cambios de configuración gratis e instantáneos.** Lo que el administrador puede
  ajustar desde su panel (ítems del checklist, tipos de evento, textos) no requiere
  desarrollo. Módulos nuevos completos son proyectos aparte.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/01-arquitectura.md](docs/01-arquitectura.md) | Arquitectura del sistema y decisiones técnicas |
| [docs/02-stack.md](docs/02-stack.md) | Stack tecnológico y justificación |
| [docs/03-modelo-datos.md](docs/03-modelo-datos.md) | Modelo de datos y relaciones |
| [docs/04-seguridad.md](docs/04-seguridad.md) | Estrategia de seguridad y aislamiento de datos |
| [docs/05-roles-permisos.md](docs/05-roles-permisos.md) | Catálogo de roles y permisos |
| [docs/06-roadmap.md](docs/06-roadmap.md) | Roadmap por fases |
| [docs/07-gestion-proyecto.md](docs/07-gestion-proyecto.md) | Convenciones y gestión del desarrollo |

## Estructura del repositorio

```
mydrive/
├── docs/              Documentación de arquitectura, seguridad y gestión
├── db/
│   ├── migrations/    Esquema de base de datos (orden numerado)
│   └── policies/      Políticas de Row Level Security (RLS)
├── backend/           Lógica de backend (Edge Functions, validaciones)
├── .github/           Plantillas y CI
└── README.md
```

El frontend (generado con v0) vive como repositorio/carpeta hermana y consume
este backend.

## Estado

Fase 1 — Fundamentos. Modelo de datos y arquitectura de seguridad definidos.

---

© Porciento Trading. Software propietario.
