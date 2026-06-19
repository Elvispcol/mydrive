-- ============================================================
-- MyDrive — Migración 04: Funciones de seguridad y auditoría
-- ============================================================

-- ------------------------------------------------------------
-- Funciones auxiliares que leen el contexto del usuario actual
-- desde su registro en 'usuario' (enlazado por auth.uid()).
-- Se usan en TODAS las políticas RLS.
-- 'security definer' permite leer la tabla usuario sin que la
-- propia RLS de usuario cause recursión.
-- ------------------------------------------------------------

create or replace function mydrive_org_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select org_id from usuario where auth_id = auth.uid() limit 1;
$$;

create or replace function mydrive_region_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select region_id from usuario where auth_id = auth.uid() limit 1;
$$;

create or replace function mydrive_rol()
returns text
language sql stable security definer
set search_path = public
as $$
  select rol from usuario where auth_id = auth.uid() limit 1;
$$;

-- True si el usuario actual ve toda la organización (director).
create or replace function mydrive_es_nacional()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select rol = 'director' from usuario where auth_id = auth.uid() limit 1),
    false
  );
$$;

-- ------------------------------------------------------------
-- AUDITORIA: registro inmutable de quién hizo qué y cuándo.
-- Requisito para flota corporativa y revisión de seguridad.
-- ------------------------------------------------------------
create table auditoria (
  id          bigserial primary key,
  org_id      uuid,
  usuario_id  uuid,
  auth_id     uuid,
  accion      text not null,            -- 'insert' | 'update' | 'delete'
  tabla       text not null,
  registro_id text,
  datos_antes jsonb,
  datos_despues jsonb,
  ocurrido_en timestamptz not null default now()
);

create index idx_auditoria_org    on auditoria(org_id);
create index idx_auditoria_tabla  on auditoria(tabla);
create index idx_auditoria_fecha  on auditoria(ocurrido_en);

-- Trigger genérico de auditoría. Se adjunta a las tablas sensibles.
create or replace function fn_auditoria()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_usuario_id uuid;
begin
  select id into v_usuario_id from usuario where auth_id = auth.uid() limit 1;

  insert into auditoria(org_id, usuario_id, auth_id, accion, tabla, registro_id, datos_antes, datos_despues)
  values (
    coalesce((case when tg_op = 'DELETE' then old.org_id else new.org_id end), null),
    v_usuario_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id else new.id end)::text, null),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- Adjuntar auditoría a las tablas con datos sensibles o de gestión.
create trigger aud_vehiculo     after insert or update or delete on vehiculo     for each row execute function fn_auditoria();
create trigger aud_usuario      after insert or update or delete on usuario      for each row execute function fn_auditoria();
create trigger aud_asignacion   after insert or update or delete on asignacion   for each row execute function fn_auditoria();
create trigger aud_evento       after insert or update or delete on evento       for each row execute function fn_auditoria();
create trigger aud_novedad      after insert or update or delete on novedad      for each row execute function fn_auditoria();
create trigger aud_tarea        after insert or update or delete on tarea        for each row execute function fn_auditoria();
create trigger aud_mantenimiento after insert or update or delete on mantenimiento for each row execute function fn_auditoria();
