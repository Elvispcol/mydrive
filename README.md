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

## Estado actual

```
Fase 0  ▓▓▓▓▓░░░░░  en preparación
Fase 1  ▓▓▓▓▓▓▓▓▓▓  COMPLETADA (maqueta + MVP funcional)
Fase 2  ▓▓▓▓▓▓▓▓▓▓  COMPLETADA (base de datos + RLS)
Fase 3  ▓▓▓▓▓▓▓▓▓▓  COMPLETADA (frontend + edge functions desplegadas)
Fase 4  ░░░░░░░░░░  PENDIENTE  (hoja de vida, mantenimientos, dashboards)
```

## Infraestructura activa

| Servicio | URL / Referencia |
|----------|-----------------|
| Supabase (BD + Auth + Functions) | `https://hilyuohcubhrvdzapplp.supabase.co` |
| Edge Function crear-novedad | `…/functions/v1/crear-novedad` |
| Edge Function notificar-evento | `…/functions/v1/notificar-evento` |
| Repositorio | `https://github.com/Elvispcol/mydrive` |
| Frontend (local) | `cd frontend && npm run dev` |
| Frontend (producción) | Vercel — pendiente de despliegue |

## Próximos pasos

1. Configurar Resend — agregar `RESEND_API_KEY` y `CORREO_FLOTA_DESTINO` en Supabase Secrets
2. Desplegar frontend en Vercel
3. Prueba end-to-end: login → preoperacional → novedad → tarea
4. Iniciar Fase 4: hoja de vida completa, mantenimientos preventivos, dashboards

## Cuentas de demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Director | `director@mydrive.demo` | `Demo1234!` |
| Admin región Caribe | `admin@mydrive.demo` | `Demo1234!` |
| Conductor | `conductor@mydrive.demo` | `Demo1234!` |

## Estructura del repositorio

```
mydrive/
├── docs/              Documentación de arquitectura, seguridad y gestión
│   └── v0-prompt.md   Prompts para generar/iterar UI con v0.dev
├── db/
│   ├── migrations/    Esquema de base de datos (aplicado en Supabase)
│   └── policies/      Políticas de Row Level Security (activas)
├── supabase/
│   └── functions/
│       ├── crear-novedad/     Edge Function: genera novedades desde preoperacional (desplegada)
│       └── notificar-evento/  Edge Function: notifica eventos y crea novedades (desplegada)
├── frontend/          Next.js 16.2.9 App Router + Supabase SSR
│   ├── app/           Páginas (login, /admin, /conductor, /director)
│   ├── components/    Componentes reutilizables
│   └── lib/supabase/  Clientes y tipos TypeScript
└── README.md
```

## Arrancar el frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Las credenciales de Supabase van en `frontend/.env.local` (no versionado):

```env
NEXT_PUBLIC_SUPABASE_URL=https://hilyuohcubhrvdzapplp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

### Windows: ruta con `#` en el nombre de carpeta

Next.js 16 App Router usa `path#exportName` internamente (React Server Components
manifest). Si el proyecto vive en una ruta que contiene `#` (ej: `#. Proyectos IA
Empresas`), webpack corrompe las rutas y el servidor falla con 500.

**Solución permanente:** renombrar la carpeta padre eliminando el `#`.

**Solución temporal:** ejecutar el servidor desde `cmd.exe` apuntando a una copia
del proyecto en una ruta limpia (ej: `C:\mydrive\frontend`):

```bat
cd /d C:\mydrive\frontend
npm run dev
```

## Documentación técnica

| Documento | Contenido |
|-----------|-----------|
| [docs/01-arquitectura.md](docs/01-arquitectura.md) | Arquitectura y decisiones técnicas (ADRs) |
| [docs/02-stack.md](docs/02-stack.md) | Stack tecnológico y justificación |
| [docs/03-modelo-datos.md](docs/03-modelo-datos.md) | Modelo de datos y relaciones |
| [docs/04-seguridad.md](docs/04-seguridad.md) | Estrategia RLS e isolamiento multi-tenant |
| [docs/05-roles-permisos.md](docs/05-roles-permisos.md) | Catálogo de roles y matriz de permisos |
| [docs/06-roadmap.md](docs/06-roadmap.md) | Roadmap por fases |
| [docs/07-gestion-proyecto.md](docs/07-gestion-proyecto.md) | Convenciones de desarrollo |

## Modelo de negocio

- **Producto propio bajo licencia.** El cliente paga por usar MyDrive; el software
  es de Porciento Trading.
- **Precio por profundidad, no por volumen.** El cliente paga por las capacidades
  (tiers de funcionalidad), nunca por cantidad de vehículos.
- **Cambios de configuración gratis e instantáneos.** Lo que el administrador puede
  ajustar desde su panel (ítems del checklist, tipos de evento) no requiere desarrollo.

---

© Porciento Trading. Software propietario.
