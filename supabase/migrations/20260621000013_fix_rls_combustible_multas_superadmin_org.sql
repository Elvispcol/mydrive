-- ============================================================
-- MyDrive — Migración 13
-- ============================================================
-- 1. Corrige RLS en combustible y multa_infraccion:
--    Las políticas "admin region" en estas tablas usan
--    EXISTS (SELECT 1 FROM vehiculo ...) directamente, lo que
--    causa la misma recursión infinita que se corrigió en
--    asignacion/mantenimiento/doc_vehiculo (mig. 11/12).
--    Ahora usan mydrive_vehiculo_en_mi_region() SECURITY DEFINER.
--
-- 2. Habilita superadmin para leer/actualizar organizacion
--    (actualmente sólo los miembros de una org pueden ver la suya).
--
-- 3. Agrega políticas para checklist_plantilla y checklist_item
--    si no existen (idempotente con DROP IF EXISTS).
--
-- 4. Asegura que region_id en combustible y multa_infraccion
--    acepte NULL en los INSERT del trigger (robustez).
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. COMBUSTIBLE — reconstruir política admin region
-- ──────────────────────────────────────────────────────────────

ALTER TABLE combustible ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comb: superadmin todo"   ON combustible;
DROP POLICY IF EXISTS "comb: director todo"      ON combustible;
DROP POLICY IF EXISTS "comb: admin region"       ON combustible;
DROP POLICY IF EXISTS "combustible: superadmin"  ON combustible;
DROP POLICY IF EXISTS "combustible: director"    ON combustible;
DROP POLICY IF EXISTS "combustible: admin"       ON combustible;

CREATE POLICY "comb: superadmin todo" ON combustible TO authenticated
  USING (mydrive_es_superadmin());

CREATE POLICY "comb: director todo" ON combustible TO authenticated
  USING     (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin())
  WITH CHECK (org_id = mydrive_org_id() AND mydrive_es_nacional());

CREATE POLICY "comb: admin region" ON combustible TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND NOT mydrive_es_superadmin()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  );


-- ──────────────────────────────────────────────────────────────
-- 2. MULTA_INFRACCION — reconstruir política admin region
-- ──────────────────────────────────────────────────────────────

ALTER TABLE multa_infraccion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "multa: superadmin todo"   ON multa_infraccion;
DROP POLICY IF EXISTS "multa: director todo"     ON multa_infraccion;
DROP POLICY IF EXISTS "multa: admin region"      ON multa_infraccion;
DROP POLICY IF EXISTS "multas: superadmin"       ON multa_infraccion;
DROP POLICY IF EXISTS "multas: director"         ON multa_infraccion;
DROP POLICY IF EXISTS "multas: admin"            ON multa_infraccion;

CREATE POLICY "multa: superadmin todo" ON multa_infraccion TO authenticated
  USING (mydrive_es_superadmin());

CREATE POLICY "multa: director todo" ON multa_infraccion TO authenticated
  USING     (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin())
  WITH CHECK (org_id = mydrive_org_id() AND mydrive_es_nacional());

CREATE POLICY "multa: admin region" ON multa_infraccion TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND NOT mydrive_es_superadmin()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  );


-- ──────────────────────────────────────────────────────────────
-- 3. ORGANIZACION — habilitar acceso superadmin
-- ──────────────────────────────────────────────────────────────

ALTER TABLE organizacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org: superadmin todo"   ON organizacion;
DROP POLICY IF EXISTS "org: miembro puede leer" ON organizacion;

-- El superadmin lee y escribe cualquier org
CREATE POLICY "org: superadmin todo" ON organizacion TO authenticated
  USING     (mydrive_es_superadmin())
  WITH CHECK (mydrive_es_superadmin());

-- Cada usuario autenticado lee sólo su propia org
CREATE POLICY "org: miembro puede leer" ON organizacion TO authenticated
  USING (id = mydrive_org_id() AND NOT mydrive_es_superadmin());


-- ──────────────────────────────────────────────────────────────
-- 4. CHECKLIST_PLANTILLA — políticas completas (idempotente)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE checklist_plantilla ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cp: superadmin todo" ON checklist_plantilla;
DROP POLICY IF EXISTS "cp: director todo"   ON checklist_plantilla;
DROP POLICY IF EXISTS "cp: admin region"    ON checklist_plantilla;
DROP POLICY IF EXISTS "cp: admin todo"      ON checklist_plantilla;

CREATE POLICY "cp: superadmin todo" ON checklist_plantilla TO authenticated
  USING (mydrive_es_superadmin());

CREATE POLICY "cp: director todo" ON checklist_plantilla TO authenticated
  USING     (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin())
  WITH CHECK (org_id = mydrive_org_id() AND mydrive_es_nacional());

-- Admin puede ver y crear plantillas de su org (sin filtro de región — las plantillas son org-level)
CREATE POLICY "cp: admin todo" ON checklist_plantilla TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND NOT mydrive_es_superadmin()
  )
  WITH CHECK (org_id = mydrive_org_id());


-- ──────────────────────────────────────────────────────────────
-- 5. CHECKLIST_ITEM — acceso vía plantilla (sin org_id propio)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE checklist_item ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ci: autenticado puede todo" ON checklist_item;
DROP POLICY IF EXISTS "ci: via plantilla"          ON checklist_item;

-- Los ítems son accesibles si el usuario tiene acceso a la plantilla padre.
-- Usamos una función SECURITY DEFINER para evitar recursión.
CREATE OR REPLACE FUNCTION mydrive_plantilla_es_mi_org(p_plantilla_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM checklist_plantilla
    WHERE id = p_plantilla_id AND org_id = mydrive_org_id()
  );
$$;

CREATE POLICY "ci: via plantilla" ON checklist_item TO authenticated
  USING (mydrive_plantilla_es_mi_org(plantilla_id) OR mydrive_es_superadmin())
  WITH CHECK (mydrive_plantilla_es_mi_org(plantilla_id) OR mydrive_es_superadmin());


-- ──────────────────────────────────────────────────────────────
-- 6. PLATAFORMA_ADMIN — cada admin lee su propio registro
--    (idempotente — puede haber existido desde migración 08)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE plataforma_admin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pa: superadmin lee su fila"  ON plataforma_admin;
DROP POLICY IF EXISTS "pa: leer propio"              ON plataforma_admin;

CREATE POLICY "pa: leer propio" ON plataforma_admin TO authenticated
  USING (auth_id = auth.uid());
