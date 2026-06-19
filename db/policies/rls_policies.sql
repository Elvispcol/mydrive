-- ============================================================
-- MyDrive — Políticas de Row Level Security (RLS)
-- El muro de aislamiento de tres niveles:
--   1. Organización  (multi-tenant)
--   2. Región        (alcance del admin de apoyo)
--   3. Rol           (el conductor solo ve lo suyo)
--
-- Toda consulta filtra ANTES de devolver una sola fila.
-- Un error en el frontend NO puede filtrar datos cruzados.
-- ============================================================

-- Habilitar RLS en todas las tablas con datos de cliente.
alter table organizacion       enable row level security;
alter table region             enable row level security;
alter table usuario            enable row level security;
alter table vehiculo           enable row level security;
alter table documento_vehiculo enable row level security;
alter table asignacion         enable row level security;
alter table checklist_plantilla enable row level security;
alter table checklist_item     enable row level security;
alter table preoperacional     enable row level security;
alter table preoperacional_respuesta enable row level security;
alter table evento             enable row level security;
alter table novedad            enable row level security;
alter table tarea              enable row level security;
alter table mantenimiento      enable row level security;
alter table auditoria          enable row level security;

-- ============================================================
-- PATRÓN GENERAL
-- Para tablas con org_id + region_id, la política de lectura es:
--   org_id = mydrive_org_id()                      (muro 1)
--   AND (mydrive_es_nacional()                     (director ve todo)
--        OR region_id = mydrive_region_id())       (muro 2)
-- El muro 3 (rol del conductor) se aplica en tablas específicas.
-- ============================================================

-- ---------- ORGANIZACION ----------
-- Un usuario solo ve su propia organización.
create policy org_select on organizacion
  for select using (id = mydrive_org_id());

-- ---------- REGION ----------
create policy region_select on region
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional() or id = mydrive_region_id())
  );

-- ---------- USUARIO ----------
-- Director: ve todos los de su org.
-- Admin de apoyo: ve los de su región.
-- Conductor: solo se ve a sí mismo.
create policy usuario_select on usuario
  for select using (
    org_id = mydrive_org_id()
    and (
      mydrive_es_nacional()
      or (mydrive_rol() = 'admin_apoyo' and region_id = mydrive_region_id())
      or (mydrive_rol() = 'conductor' and auth_id = auth.uid())
    )
  );

-- Solo director y admin de apoyo crean/editan usuarios (en su alcance).
create policy usuario_insert on usuario
  for insert with check (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or (mydrive_rol() = 'admin_apoyo' and region_id = mydrive_region_id()))
  );

create policy usuario_update on usuario
  for update using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or (mydrive_rol() = 'admin_apoyo' and region_id = mydrive_region_id()))
  );

-- ---------- VEHICULO ----------
create policy vehiculo_select on vehiculo
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional() or region_id = mydrive_region_id())
  );

create policy vehiculo_modificar on vehiculo
  for all using (
    org_id = mydrive_org_id()
    and mydrive_rol() in ('director', 'admin_apoyo')
    and (mydrive_es_nacional() or region_id = mydrive_region_id())
  ) with check (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional() or region_id = mydrive_region_id())
  );

-- ---------- DOCUMENTO_VEHICULO ----------
create policy doc_select on documento_vehiculo
  for select using (
    exists (
      select 1 from vehiculo v
      where v.id = documento_vehiculo.vehiculo_id
        and v.org_id = mydrive_org_id()
        and (mydrive_es_nacional() or v.region_id = mydrive_region_id())
    )
  );

create policy doc_modificar on documento_vehiculo
  for all using (
    mydrive_rol() in ('director', 'admin_apoyo')
    and exists (
      select 1 from vehiculo v
      where v.id = documento_vehiculo.vehiculo_id
        and v.org_id = mydrive_org_id()
        and (mydrive_es_nacional() or v.region_id = mydrive_region_id())
    )
  );

-- ---------- ASIGNACION ----------
create policy asignacion_select on asignacion
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or exists (select 1 from vehiculo v where v.id = asignacion.vehiculo_id
                    and v.region_id = mydrive_region_id())
         or usuario_id = (select id from usuario where auth_id = auth.uid()))
  );

create policy asignacion_modificar on asignacion
  for all using (
    org_id = mydrive_org_id()
    and mydrive_rol() in ('director', 'admin_apoyo')
  ) with check (org_id = mydrive_org_id());

-- ---------- CHECKLIST (plantilla e ítems) ----------
create policy checklist_plantilla_select on checklist_plantilla
  for select using (org_id = mydrive_org_id());

create policy checklist_plantilla_modificar on checklist_plantilla
  for all using (org_id = mydrive_org_id() and mydrive_rol() in ('director','admin_apoyo'))
  with check (org_id = mydrive_org_id());

create policy checklist_item_select on checklist_item
  for select using (
    exists (select 1 from checklist_plantilla p
            where p.id = checklist_item.plantilla_id and p.org_id = mydrive_org_id())
  );

create policy checklist_item_modificar on checklist_item
  for all using (
    mydrive_rol() in ('director','admin_apoyo')
    and exists (select 1 from checklist_plantilla p
                where p.id = checklist_item.plantilla_id and p.org_id = mydrive_org_id())
  );

-- ---------- PREOPERACIONAL ----------
-- Conductor: crea y ve los suyos.
-- Admin de apoyo: ve los de su región.
-- Director: ve todos.
create policy preop_select on preoperacional
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or (mydrive_rol() = 'admin_apoyo' and region_id = mydrive_region_id())
         or (mydrive_rol() = 'conductor'  and usuario_id = (select id from usuario where auth_id = auth.uid())))
  );

create policy preop_insert on preoperacional
  for insert with check (
    org_id = mydrive_org_id()
    and usuario_id = (select id from usuario where auth_id = auth.uid())
  );

create policy preop_resp_select on preoperacional_respuesta
  for select using (
    exists (select 1 from preoperacional pre
            where pre.id = preoperacional_respuesta.preoperacional_id
              and pre.org_id = mydrive_org_id()
              and (mydrive_es_nacional()
                   or (mydrive_rol()='admin_apoyo' and pre.region_id = mydrive_region_id())
                   or (mydrive_rol()='conductor' and pre.usuario_id = (select id from usuario where auth_id = auth.uid()))))
  );

create policy preop_resp_insert on preoperacional_respuesta
  for insert with check (
    exists (select 1 from preoperacional pre
            where pre.id = preoperacional_respuesta.preoperacional_id
              and pre.usuario_id = (select id from usuario where auth_id = auth.uid()))
  );

-- ---------- EVENTO ----------
create policy evento_select on evento
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or (mydrive_rol() = 'admin_apoyo' and region_id = mydrive_region_id())
         or (mydrive_rol() = 'conductor'  and usuario_id = (select id from usuario where auth_id = auth.uid())))
  );

create policy evento_insert on evento
  for insert with check (
    org_id = mydrive_org_id()
    and usuario_id = (select id from usuario where auth_id = auth.uid())
  );

create policy evento_update on evento
  for update using (
    org_id = mydrive_org_id()
    and mydrive_rol() in ('director','admin_apoyo')
    and (mydrive_es_nacional() or region_id = mydrive_region_id())
  );

-- ---------- NOVEDAD ----------
create policy novedad_select on novedad
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional() or region_id = mydrive_region_id())
  );

create policy novedad_modificar on novedad
  for all using (
    org_id = mydrive_org_id()
    and mydrive_rol() in ('director','admin_apoyo')
    and (mydrive_es_nacional() or region_id = mydrive_region_id())
  ) with check (org_id = mydrive_org_id());

-- ---------- TAREA ----------
-- Admin gestiona las de su región; el responsable ve y actualiza la suya.
create policy tarea_select on tarea
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or region_id = mydrive_region_id()
         or asignado_a = (select id from usuario where auth_id = auth.uid()))
  );

create policy tarea_modificar on tarea
  for all using (
    org_id = mydrive_org_id()
    and (
      (mydrive_rol() in ('director','admin_apoyo')
       and (mydrive_es_nacional() or region_id = mydrive_region_id()))
      or asignado_a = (select id from usuario where auth_id = auth.uid())
    )
  ) with check (org_id = mydrive_org_id());

-- ---------- MANTENIMIENTO ----------
create policy mant_select on mantenimiento
  for select using (
    org_id = mydrive_org_id()
    and (mydrive_es_nacional()
         or exists (select 1 from vehiculo v where v.id = mantenimiento.vehiculo_id
                    and v.region_id = mydrive_region_id()))
  );

create policy mant_modificar on mantenimiento
  for all using (
    org_id = mydrive_org_id()
    and mydrive_rol() in ('director','admin_apoyo')
  ) with check (org_id = mydrive_org_id());

-- ---------- AUDITORIA ----------
-- Solo lectura, y solo el director ve la auditoría de su org.
create policy auditoria_select on auditoria
  for select using (org_id = mydrive_org_id() and mydrive_es_nacional());
