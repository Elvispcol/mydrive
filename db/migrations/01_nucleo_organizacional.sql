-- ============================================================
-- MyDrive — Migración 01: Núcleo organizacional
-- Organización (tenant) → Región → Usuarios y Vehículos
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ORGANIZACION: el tenant. Cada cliente es una fila.
-- Todo el aislamiento multi-tenant cuelga de aquí.
-- ------------------------------------------------------------
create table organizacion (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  nit           text,                         -- identificación fiscal del cliente
  plan_licencia text not null default 'mvp',  -- tier de profundidad contratado
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REGION: sedes o zonas del cliente (Caribe, Andina, etc.)
-- Define el alcance de los administradores de apoyo.
-- ------------------------------------------------------------
create table region (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references organizacion(id) on delete restrict,
  nombre    text not null,
  activo    boolean not null default true,
  creado_en timestamptz not null default now()
);

create index idx_region_org on region(org_id);

-- ------------------------------------------------------------
-- USUARIO: toda la gente. Director, administradores de apoyo,
-- conductores. La diferencia es 'rol' y 'region_id'.
-- 'auth_id' enlaza con Supabase Auth (auth.users).
-- ------------------------------------------------------------
create table usuario (
  id         uuid primary key default gen_random_uuid(),
  auth_id    uuid unique,                       -- referencia a auth.users de Supabase
  org_id     uuid not null references organizacion(id) on delete restrict,
  region_id  uuid references region(id) on delete restrict, -- null = alcance nacional (director)
  rol        text not null check (rol in ('director', 'admin_apoyo', 'conductor')),
  nombre     text not null,
  email      text not null,
  documento  text,                              -- cédula / identificación
  telefono   text,
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);

create index idx_usuario_org    on usuario(org_id);
create index idx_usuario_region on usuario(region_id);
create index idx_usuario_auth   on usuario(auth_id);

-- Un director no se ata a una región (alcance nacional).
-- Un admin_apoyo y un conductor sí deben tener región.
alter table usuario add constraint chk_region_por_rol
  check (
    (rol = 'director') or
    (rol in ('admin_apoyo', 'conductor') and region_id is not null)
  );
