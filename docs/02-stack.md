# 02 — Stack tecnológico

## Resumen

| Capa | Tecnología | Rol |
|------|-----------|-----|
| Frontend | Next.js (App Router) | UI web y móvil, generado con v0 |
| Hosting frontend | Vercel | Despliegue del frontend |
| Backend / BD | Supabase (PostgreSQL) | Base de datos, autenticación, almacenamiento |
| Autenticación | Supabase Auth | Roles, JWT, sesiones |
| Aislamiento | PostgreSQL Row Level Security | Seguridad a nivel de fila |
| Almacenamiento | Supabase Storage | Fotos de eventos y documentos |
| Lógica de servidor | Supabase Edge Functions | Validaciones, generación de novedades |
| Correo | Resend | Notificaciones automáticas |

## Justificación de cada decisión

### Next.js + v0 (frontend)
v0 (de Vercel) genera interfaces Next.js de alta calidad rápidamente. Permite
prototipar la maqueta de venta en días e iterar la UI sin tocar el backend. Next.js
sirve tanto la web del administrador como la experiencia móvil del conductor (web
responsive; una app nativa es una decisión futura si el cliente la exige).

### Supabase (backend)
La decisión central del proyecto. Razones:

- **PostgreSQL gestionado.** Base de datos relacional madura, sin administrar
  servidores.
- **Row Level Security nativo.** Es el mecanismo que garantiza el aislamiento
  multi-tenant y por región en la capa de datos. Este es el argumento de seguridad
  más fuerte ante el área de TI del cliente.
- **Auth con roles incluido.** No hay que construir autenticación desde cero.
- **Storage integrado.** Las fotos de eventos y documentos de vehículos se guardan
  con las mismas reglas de seguridad.
- **Edge Functions.** Para lógica que no debe vivir en el cliente (crear novedades,
  disparar correos).

### Resend (correo)
Para las notificaciones automáticas (un choque llega al correo de flota, alertas de
mantenimiento). API simple, buena entregabilidad.

## Costo y escalamiento

El costo de infraestructura escala con el volumen real (usuarios activos,
almacenamiento de fotos, correos enviados). **Esto es interno y no se refleja en el
precio al cliente**, que se ancla en la profundidad de la solución. Por dentro se
definen rangos de operación por tier para proteger el margen.

En fase MVP/piloto, el stack opera en los planes de entrada de Supabase, Vercel y
Resend a costo bajo o nulo. El salto a planes de producción ocurre cuando el cliente
firma y escala, momento en que el ingreso ya cubre el costo.

## Herramientas de desarrollo

| Herramienta | Uso |
|-------------|-----|
| Claude Code | Copiloto de backend, trabaja sobre los archivos locales y Supabase |
| v0 | Generación del frontend |
| Git / GitHub | Control de versiones, monorepo |
| Supabase CLI | Migraciones de base de datos, despliegue de funciones |

## Lo que deliberadamente NO se usa (todavía)

- **App nativa (iOS/Android):** se empieza con web responsive. Nativa solo si el
  cliente la exige y la financia.
- **Microservicios:** innecesarios en esta escala. Un backend Supabase bien
  estructurado es suficiente y más mantenible para un solo desarrollador.
- **Infraestructura propia (servidores, Kubernetes):** sería un riesgo de seguridad
  y operación para un equipo de una persona. Los servicios gestionados son la
  decisión correcta.
