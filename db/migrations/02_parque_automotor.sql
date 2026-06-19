-- ============================================================
-- MyDrive — Migración 02: Parque automotor y ciclo de vida
-- ============================================================

-- ------------------------------------------------------------
-- VEHICULO: la hoja de vida del vehículo.
-- 'estado' rastrea su ciclo de vida.
-- ------------------------------------------------------------
create table vehiculo (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizacion(id) on delete restrict,
  region_id   uuid not null references region(id) on delete restrict,
  placa       text not null,
  marca       text,
  linea       text,
  modelo_anio int,
  tipo        text,                       -- automóvil, camioneta, camión, etc.
  estado      text not null default 'activo'
              check (estado in ('activo', 'mantenimiento', 'inactivo', 'vendido')),
  creado_en   timestamptz not null default now(),
  unique (org_id, placa)
);

create index idx_vehiculo_org    on vehiculo(org_id);
create index idx_vehiculo_region on vehiculo(region_id);

-- ------------------------------------------------------------
-- DOCUMENTO_VEHICULO: SOAT, tecnomecánica, etc. con vencimientos.
-- Permite alertas de documentos por vencer.
-- ------------------------------------------------------------
create table documento_vehiculo (
  id          uuid primary key default gen_random_uuid(),
  vehiculo_id uuid not null references vehiculo(id) on delete cascade,
  tipo        text not null,              -- 'soat', 'tecnomecanica', 'poliza', etc.
  numero      text,
  vence_en    date,
  archivo_url text,                       -- en Supabase Storage
  creado_en   timestamptz not null default now()
);

create index idx_doc_vehiculo on documento_vehiculo(vehiculo_id);
create index idx_doc_vence     on documento_vehiculo(vence_en);

-- ------------------------------------------------------------
-- ASIGNACION: resuelve el ciclo de vida usuario-vehículo.
-- Cambio de vehículo = cerrar una asignación + abrir otra.
-- Salida de usuario / venta = se registra 'hasta', no se borra.
-- ------------------------------------------------------------
create table asignacion (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizacion(id) on delete restrict,
  vehiculo_id  uuid not null references vehiculo(id) on delete restrict,
  usuario_id   uuid not null references usuario(id) on delete restrict,
  desde        date not null default current_date,
  hasta        date,                      -- null = asignación vigente
  motivo_fin   text,                      -- 'cambio_vehiculo', 'salida_usuario', 'venta', etc.
  creado_en    timestamptz not null default now()
);

create index idx_asignacion_vehiculo on asignacion(vehiculo_id);
create index idx_asignacion_usuario  on asignacion(usuario_id);
create index idx_asignacion_org      on asignacion(org_id);

-- Solo una asignación vigente (hasta is null) por vehículo a la vez.
create unique index idx_asignacion_vigente
  on asignacion(vehiculo_id)
  where hasta is null;
