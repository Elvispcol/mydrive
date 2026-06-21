-- ============================================================
-- MyDrive — Seed 01: Porciento Trading (organización fundadora)
-- ============================================================
-- INSTRUCCIONES ANTES DE CORRER:
--   1. En Supabase → Authentication → Users → "Add user"
--      Email: elvis.p.col@gmail.com  Password: (temporal)
--   2. Copia el UUID que Supabase genera
--   3. Reemplaza ELVIS_AUTH_UUID abajo con ese UUID
--   4. Corre en Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_org_id       uuid;
  v_region_id    uuid;
  v_usuario_id   uuid;
  v_plantilla_id uuid;
  v_elvis_auth   uuid := 'ELVIS_AUTH_UUID'; -- ← REEMPLAZAR
BEGIN

  -- 1. Organización
  INSERT INTO organizacion (nombre, nit, plan_licencia, pais_codigo, idioma, moneda, zona_horaria)
  VALUES ('Porciento Trading', '900000000-0', 'enterprise', 'CO', 'es', 'COP', 'America/Bogota')
  RETURNING id INTO v_org_id;

  -- 2. Región nacional
  INSERT INTO region (org_id, nombre)
  VALUES (v_org_id, 'Colombia — Nacional')
  RETURNING id INTO v_region_id;

  -- 3. Usuario director (Elvis dentro de su org)
  INSERT INTO usuario (auth_id, org_id, rol, nombre, email, activo)
  VALUES (v_elvis_auth, v_org_id, 'director', 'Elvis', 'elvis.p.col@gmail.com', true)
  RETURNING id INTO v_usuario_id;

  -- 4. Superadmin de plataforma (acceso a TODAS las orgs)
  INSERT INTO plataforma_admin (auth_id, nombre, email)
  VALUES (v_elvis_auth, 'Elvis — Fundador MyDrive', 'elvis.p.col@gmail.com');

  -- 5. Checklist de preoperacional estándar
  INSERT INTO checklist_plantilla (org_id, nombre, activa)
  VALUES (v_org_id, 'Inspección Diaria Estándar', true)
  RETURNING id INTO v_plantilla_id;

  INSERT INTO checklist_item (plantilla_id, texto, orden, critico) VALUES
    (v_plantilla_id, 'Nivel de aceite del motor',               1,  true),
    (v_plantilla_id, 'Nivel de agua / refrigerante',            2,  true),
    (v_plantilla_id, 'Presión y estado de las llantas',         3,  true),
    (v_plantilla_id, 'Frenos (pedal firme y sin ruidos)',       4,  true),
    (v_plantilla_id, 'Luces delanteras y traseras',             5,  false),
    (v_plantilla_id, 'Luces de emergencia / direccionales',     6,  false),
    (v_plantilla_id, 'Limpiabrisas funcional',                  7,  false),
    (v_plantilla_id, 'Espejos ajustados y sin grietas',         8,  false),
    (v_plantilla_id, 'Cinturones de seguridad',                 9,  true),
    (v_plantilla_id, 'Extintor vigente a bordo',               10,  true),
    (v_plantilla_id, 'Botiquín a bordo',                       11,  false),
    (v_plantilla_id, 'Documentos del vehículo al día',         12,  true),
    (v_plantilla_id, 'Carrocería sin daños nuevos',            13,  false),
    (v_plantilla_id, 'Combustible suficiente para la jornada', 14,  false);

  RAISE NOTICE 'Seed OK — org_id: %  region_id: %  usuario_id: %',
    v_org_id, v_region_id, v_usuario_id;

END $$;
