// Tipos TypeScript derivados del esquema de base de datos de MyDrive.
// Refleja las tablas definidas en db/migrations/.
// Actualizar aquí si se agregan columnas en una nueva migración.

export type Rol = 'director' | 'admin_apoyo' | 'conductor'
export type EstadoVehiculo = 'activo' | 'mantenimiento' | 'inactivo' | 'vendido'
export type Prioridad = 'baja' | 'media' | 'alta' | 'critica'
export type EstadoNovedad = 'abierta' | 'en_proceso' | 'cerrada'
export type EstadoTarea = 'abierta' | 'en_proceso' | 'cerrada'
export type ResultadoPreop = 'ok' | 'con_novedades'
export type EstadoEvento = 'reportado' | 'en_gestion' | 'cerrado'
export type OrigenNovedad = 'preoperacional' | 'evento' | 'manual' | 'documento'

export interface Organizacion {
  id: string
  nombre: string
  nit: string | null
  plan_licencia: string
  activo: boolean
  creado_en: string
}

export interface Region {
  id: string
  org_id: string
  nombre: string
  activo: boolean
  creado_en: string
}

export interface Usuario {
  id: string
  auth_id: string | null
  org_id: string
  region_id: string | null
  rol: Rol
  nombre: string
  email: string
  documento: string | null
  telefono: string | null
  activo: boolean
  creado_en: string
}

export interface Vehiculo {
  id: string
  org_id: string
  region_id: string
  placa: string
  marca: string | null
  linea: string | null
  modelo_anio: number | null
  tipo: string | null
  estado: EstadoVehiculo
  creado_en: string
}

export interface Asignacion {
  id: string
  org_id: string
  vehiculo_id: string
  usuario_id: string
  desde: string
  hasta: string | null
  motivo_fin: string | null
  creado_en: string
}

export interface ChecklistPlantilla {
  id: string
  org_id: string
  nombre: string
  activa: boolean
  creado_en: string
}

export interface ChecklistItem {
  id: string
  plantilla_id: string
  texto: string
  orden: number
  critico: boolean
}

export interface Preoperacional {
  id: string
  org_id: string
  region_id: string
  vehiculo_id: string
  usuario_id: string
  plantilla_id: string | null
  fecha: string
  resultado: ResultadoPreop
  observacion: string | null
}

export interface PreoperacionalRespuesta {
  id: string
  preoperacional_id: string
  item_id: string
  aprobado: boolean
  nota: string | null
}

export interface Evento {
  id: string
  org_id: string
  region_id: string
  vehiculo_id: string
  usuario_id: string
  tipo: string
  descripcion: string | null
  foto_url: string | null
  lat: number | null
  lng: number | null
  estado: EstadoEvento
  creado_en: string
}

export interface Novedad {
  id: string
  org_id: string
  region_id: string
  vehiculo_id: string | null
  origen_tipo: OrigenNovedad
  origen_id: string | null
  titulo: string
  descripcion: string | null
  prioridad: Prioridad
  estado: EstadoNovedad
  creado_en: string
}

export interface Tarea {
  id: string
  org_id: string
  region_id: string
  novedad_id: string | null
  titulo: string
  descripcion: string | null
  asignado_a: string | null
  creado_por: string | null
  prioridad: Prioridad
  vence_en: string | null
  estado: EstadoTarea
  creado_en: string
}

export interface Mantenimiento {
  id: string
  org_id: string
  vehiculo_id: string
  tarea_id: string | null
  tipo: string
  descripcion: string | null
  costo: number | null
  fecha: string
  proximo_en: string | null
  creado_en: string
}

// Tipo placeholder para el cliente Supabase tipado
// Se puede reemplazar con los tipos generados por `supabase gen types typescript`
export type Database = {
  public: {
    Tables: {
      organizacion: { Row: Organizacion; Insert: Partial<Organizacion>; Update: Partial<Organizacion> }
      region: { Row: Region; Insert: Partial<Region>; Update: Partial<Region> }
      usuario: { Row: Usuario; Insert: Partial<Usuario>; Update: Partial<Usuario> }
      vehiculo: { Row: Vehiculo; Insert: Partial<Vehiculo>; Update: Partial<Vehiculo> }
      asignacion: { Row: Asignacion; Insert: Partial<Asignacion>; Update: Partial<Asignacion> }
      checklist_plantilla: { Row: ChecklistPlantilla; Insert: Partial<ChecklistPlantilla>; Update: Partial<ChecklistPlantilla> }
      checklist_item: { Row: ChecklistItem; Insert: Partial<ChecklistItem>; Update: Partial<ChecklistItem> }
      preoperacional: { Row: Preoperacional; Insert: Partial<Preoperacional>; Update: Partial<Preoperacional> }
      preoperacional_respuesta: { Row: PreoperacionalRespuesta; Insert: Partial<PreoperacionalRespuesta>; Update: Partial<PreoperacionalRespuesta> }
      evento: { Row: Evento; Insert: Partial<Evento>; Update: Partial<Evento> }
      novedad: { Row: Novedad; Insert: Partial<Novedad>; Update: Partial<Novedad> }
      tarea: { Row: Tarea; Insert: Partial<Tarea>; Update: Partial<Tarea> }
      mantenimiento: { Row: Mantenimiento; Insert: Partial<Mantenimiento>; Update: Partial<Mantenimiento> }
    }
    Functions: {
      mydrive_org_id: { Args: Record<string, never>; Returns: string }
      mydrive_region_id: { Args: Record<string, never>; Returns: string }
      mydrive_rol: { Args: Record<string, never>; Returns: string }
      mydrive_es_nacional: { Args: Record<string, never>; Returns: boolean }
    }
  }
}
