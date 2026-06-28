# Buenas Prácticas Establecidas — MyDrive

Patrones y convenciones que YA están en uso. No reinventar. No cambiar sin actualizar este documento.

---

## BASE DE DATOS

### RLS — Siempre SECURITY DEFINER para subqueries cross-table
```sql
-- MAL: recursión infinita
CREATE POLICY "ver vehiculos de mi region" ON vehiculo
  FOR SELECT USING (
    region_id IN (SELECT region_id FROM usuario WHERE auth_id = auth.uid())
  );

-- BIEN: función SECURITY DEFINER rompe el ciclo
CREATE POLICY "ver vehiculos de mi region" ON vehiculo
  FOR SELECT USING (mydrive_vehiculo_en_mi_region(id));
```
**Por qué:** Las tablas vehiculo y asignacion tienen referencias cruzadas. Sin SECURITY DEFINER se produce `infinite recursion detected in policy`. Fue necesario corregirlo en migraciones 11 y 12.

### Funciones de contexto disponibles (no recrear)
```sql
mydrive_org_id()                        -- UUID de la org del usuario autenticado
mydrive_region_id()                     -- UUID de su región (null si director)
mydrive_rol()                           -- 'director' | 'admin_apoyo' | 'conductor'
mydrive_es_nacional()                   -- true si director
mydrive_es_superadmin()                 -- true si está en plataforma_admin
mydrive_vehiculo_en_mi_region(uuid)     -- true si el vehículo está en mi región
mydrive_conductor_tiene_vehiculo(uuid)  -- true si el conductor tiene esa asignación activa
mydrive_plantilla_es_mi_org(uuid)       -- true si la plantilla es de mi org
```

### org_id — nunca enviarlo desde el frontend
La migración 10 tiene un trigger `fn_ctx_org()` BEFORE INSERT que rellena `org_id` automáticamente en 14 tablas. Omitir `org_id` en todos los payloads de INSERT del frontend.

Tablas cubiertas: `region, vehiculo, asignacion, documento_vehiculo, checklist_plantilla, preoperacional, evento, novedad, tarea, mantenimiento, mantenimiento_preventivo, combustible, multa_infraccion, taller_proveedor`

### region_id en combustible y multas
Se deriva del vehículo seleccionado, nunca del usuario:
```ts
region_id: vehiculoSeleccionado?.region_id
```

### costo_total en combustible
Es columna regular (no GENERATED). Se calcula en el cliente:
```ts
costo_total: litros * costo_litro
```

---

## SUPABASE CLI

### Siempre desde la raíz del repo
```bash
# BIEN — desde c:\Users\PC\Documents\Proyectos IA Empresas\MyDrive
npx supabase db push --linked

# MAL — desde frontend/
cd frontend && npx supabase db push  # Error: glob supabase/migrations/... not found
```

### Naming de migraciones
Formato: `supabase/migrations/20260621000XXX_nombre_descriptivo.sql`

---

## FRONTEND

### Patrón page.tsx — thin wrapper
```tsx
// page.tsx — solo auth + rol check + render
export default async function Page({ params }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  const { data: perfil } = await supabase
    .from('usuario')
    .select('nombre, rol')
    .eq('auth_id', user.id)
    .single()
  if (!perfil || perfil.rol !== 'director') redirect(`/${locale}`)
  return <ModuloListaPage locale={locale} />
}
```

### Patrón superadmin — via plataforma_admin
```tsx
// Superadmin NO está en tabla usuario
const admin = await getSuperadminPerfil(user.id)  // busca en plataforma_admin
if (!admin) redirect(`/${locale}`)
```

### Normalización de joins Supabase
PostgREST puede devolver un join como `array` o `object`. Normalizar siempre:
```ts
vehiculo: Array.isArray(r.vehiculo) ? r.vehiculo[0] ?? null : r.vehiculo ?? null
```

### Loading states — siempre agregar loading.tsx
Toda nueva sección del dashboard necesita `loading.tsx` en su carpeta. Sin él, el usuario ve pantalla en blanco durante la navegación.

### Sidebar — ícono + texto, NUNCA solo íconos
El sidebar es `w-52` con `flex-row`, ícono `w-4` + label `text-xs`. No volver a quitar los textos. Preferencia explícita del usuario.

---

## TYPESCRIPT

### Evitar PowerShell para reemplazos masivos de texto
PowerShell 5.1 no soporta `Get-Content -Raw` correctamente. Para bulk replace en archivos `.tsx/.ts`, usar:
- La herramienta Edit archivo por archivo
- Bash + `sed -i`

**Por qué:** En 2026-06-24 un script PowerShell corrompió 121 archivos, requirió `git restore .` y rehacer todo el trabajo.

---

## ROLES DEL SISTEMA

| Rol | Alcance | region_id en tabla usuario |
|---|---|---|
| `director` | Nacional — ve toda la org | NULL |
| `admin_apoyo` | Regional — solo su región | requerido |
| `conductor` | Solo lo asignado a él | requerido |
| superadmin | Plataforma — todas las orgs | N/A (tabla plataforma_admin) |

---

## DISEÑO Y UI

### Tokens de color (globals.css)
```css
--color-primary: #3927FF
--color-primary-hover: #2c1fd6
--color-primary-tint: #ede9ff
--color-canvas: #F9F9FC
--color-surface-raised: #FFFFFF
--color-ink-900: #242533
```

### Tablas
Estructura HTML real con `<thead>` h-12 `bg-surface-raised` y `<tbody>` rows h-9. Evitar divs que simulen tablas.

### Sidebar activo
```tsx
className={isActive ? 'bg-primary-tint text-primary-hover' : 'text-ink-600'}
```
