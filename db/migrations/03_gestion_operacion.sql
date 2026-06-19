-- ============================================================
-- MyDrive — Migración 03: Captura, gestión y la cadena de valor
-- Preoperacional/Evento → Novedad → Tarea → Mantenimiento
-- ============================================================

-- ------------------------------------------------------------
-- CHECKLIST_PLANTILLA: el preoperacional es CONFIGURABLE.
-- El administrador edita los ítems desde su panel, sin código.
-- ------------------------------------------------------------
create table checklist_plantilla (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references organizacion(id) on delete restrict,
  nombre    text not null,
  activa    boolean not null default true,
  creado_en timestamptz not null default now()
);

create table checklist_item (
  id           uuid primary key default gen_random_uuid(),
  plantilla_id uuid not null references checklist_plantilla(id) on delete cascade,
  texto        text not null,             -- "¿Frenos en buen estado?"
  orden        int not null default 0,
  critico      boolean not null default false  -- si falla, genera novedad automática
);

create index idx_item_plantilla on checklist_item(plantilla_id);

-- ------------------------------------------------------------
-- PREOPERACIONAL: la inspección diaria del conductor.
-- ------------------------------------------------------------
create table preoperacional (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizacion(id) on delete restrict,
  region_id    uuid not null references region(id) on delete restrict,
  vehiculo_id  uuid not null references vehiculo(id) on delete restrict,
  usuario_id   uuid not null references usuario(id) on delete restrict,
  plantilla_id uuid references checklist_plantilla(id),
  fecha        timestamptz not null default now(),
  resultado    text not null default 'ok'    -- 'ok' | 'con_novedades'
               check (resultado in ('ok', 'con_novedades')),
  observacion  text
);

create index idx_preop_org      on preoperacional(org_id);
create index idx_preop_region   on preoperacional(region_id);
create index idx_preop_vehiculo on preoperacional(vehiculo_id);
create index idx_preop_fecha    on preoperacional(fecha);

-- Respuesta a cada ítem del checklist en un preoperacional.
create table preoperacional_respuesta (
  id              uuid primary key default gen_random_uuid(),
  preoperacional_id uuid not null references preoperacional(id) on delete cascade,
  item_id         uuid not null references checklist_item(id) on delete restrict,
  aprobado        boolean not null,
  nota            text
);

create index idx_preop_resp on preoperacional_respuesta(preoperacional_id);

-- ------------------------------------------------------------
-- EVENTO: reporte de choque / siniestro / incidencia.
-- Con foto (en Storage) y notificación automática por correo.
-- ------------------------------------------------------------
create table evento (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizacion(id) on delete restrict,
  region_id   uuid not null references region(id) on delete restrict,
  vehiculo_id uuid not null references vehiculo(id) on delete restrict,
  usuario_id  uuid not null references usuario(id) on delete restrict,
  tipo        text not null,             -- 'choque', 'siniestro', 'falla', etc.
  descripcion text,
  foto_url    text,                      -- en Supabase Storage
  lat         numeric,
  lng         numeric,
  estado      text not null default 'reportado'
              check (estado in ('reportado', 'en_gestion', 'cerrado')),
  creado_en   timestamptz not null default now()
);

create index idx_evento_org      on evento(org_id);
create index idx_evento_region   on evento(region_id);
create index idx_evento_vehiculo on evento(vehiculo_id);

-- ------------------------------------------------------------
-- NOVEDAD: el corazón de la gestión. Todo lo que requiere atención.
-- Nace de un preoperacional con falla, un evento, o manual.
-- ------------------------------------------------------------
create table novedad (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizacion(id) on delete restrict,
  region_id     uuid not null references region(id) on delete restrict,
  vehiculo_id   uuid references vehiculo(id) on delete restrict,
  origen_tipo   text not null,           -- 'preoperacional' | 'evento' | 'manual' | 'documento'
  origen_id     uuid,                    -- id del preoperacional/evento que la generó
  titulo        text not null,
  descripcion   text,
  prioridad     text not null default 'media'
                check (prioridad in ('baja', 'media', 'alta', 'critica')),
  estado        text not null default 'abierta'
                check (estado in ('abierta', 'en_proceso', 'cerrada')),
  creado_en     timestamptz not null default now()
);

create index idx_novedad_org    on novedad(org_id);
create index idx_novedad_region on novedad(region_id);
create index idx_novedad_estado on novedad(estado);

-- ------------------------------------------------------------
-- TAREA: la delegación. El administrador asigna a su equipo.
-- ------------------------------------------------------------
create table tarea (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizacion(id) on delete restrict,
  region_id    uuid not null references region(id) on delete restrict,
  novedad_id   uuid references novedad(id) on delete set null,
  titulo       text not null,
  descripcion  text,
  asignado_a   uuid references usuario(id) on delete set null,
  creado_por   uuid references usuario(id) on delete set null,
  prioridad    text not null default 'media'
               check (prioridad in ('baja', 'media', 'alta', 'critica')),
  vence_en     date,
  estado       text not null default 'abierta'
               check (estado in ('abierta', 'en_proceso', 'cerrada')),
  creado_en    timestamptz not null default now()
);

create index idx_tarea_org      on tarea(org_id);
create index idx_tarea_region   on tarea(region_id);
create index idx_tarea_asignado on tarea(asignado_a);
create index idx_tarea_estado   on tarea(estado);

-- ------------------------------------------------------------
-- MANTENIMIENTO: cierra el círculo, queda en la hoja de vida.
-- ------------------------------------------------------------
create table mantenimiento (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizacion(id) on delete restrict,
  vehiculo_id uuid not null references vehiculo(id) on delete restrict,
  tarea_id    uuid references tarea(id) on delete set null,
  tipo        text not null,             -- 'preventivo' | 'correctivo'
  descripcion text,
  costo       numeric,
  fecha       date not null default current_date,
  proximo_en  date,                      -- para mantenimiento preventivo programado
  creado_en   timestamptz not null default now()
);

create index idx_mant_org      on mantenimiento(org_id);
create index idx_mant_vehiculo on mantenimiento(vehiculo_id);
create index idx_mant_proximo  on mantenimiento(proximo_en);
