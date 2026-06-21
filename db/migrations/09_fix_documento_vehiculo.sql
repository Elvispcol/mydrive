-- ============================================================
-- MyDrive — Migración 09: Corrección documento_vehiculo
-- ============================================================
-- Contexto: migración 02 creó documento_vehiculo con esquema
-- mínimo. Migración 07 intentó reemplazarla con CREATE TABLE
-- IF NOT EXISTS (no-op) y sus políticas RLS fallaron porque
-- org_id no existía en la tabla.
--
-- Esta migración:
--   1. Agrega las columnas faltantes
--   2. Hace backfill de org_id desde vehiculo
--   3. Aplica NOT NULL a org_id
--   4. Agrega check constraint en tipo
--   5. Registra trigger updated_at (idempotente)
--   6. Reemplaza las políticas RLS de documento_vehiculo
--      (DROP IF EXISTS + CREATE para ser idempotente)
-- ============================================================


-- ============================================================
-- 1. COLUMNAS FALTANTES
-- ============================================================

ALTER TABLE documento_vehiculo
  ADD COLUMN IF NOT EXISTS org_id        uuid       REFERENCES organizacion(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS observaciones text,
  ADD COLUMN IF NOT EXISTS creado_por    uuid       REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz DEFAULT now();


-- ============================================================
-- 2. BACKFILL org_id desde vehiculo (para filas existentes)
-- ============================================================

UPDATE documento_vehiculo dv
SET    org_id = v.org_id
FROM   vehiculo v
WHERE  v.id = dv.vehiculo_id
  AND  dv.org_id IS NULL;


-- ============================================================
-- 3. NOT NULL en org_id
-- ============================================================

ALTER TABLE documento_vehiculo
  ALTER COLUMN org_id SET NOT NULL;


-- ============================================================
-- 4. CHECK CONSTRAINT en tipo
--    Reemplaza cualquier constraint previo para ser idempotente.
-- ============================================================

ALTER TABLE documento_vehiculo
  DROP CONSTRAINT IF EXISTS documento_vehiculo_tipo_check;

ALTER TABLE documento_vehiculo
  ADD CONSTRAINT documento_vehiculo_tipo_check
  CHECK (tipo IN ('soat','tecnomecanica','poliza_rc','poliza_todo_riesgo','tarjeta_operacion','otro'));


-- ============================================================
-- 5. TRIGGER updated_at
--    OR REPLACE para ser idempotente si migración 07 ya lo
--    creó en la tabla original.
-- ============================================================

CREATE OR REPLACE TRIGGER trg_dv_updated_at
  BEFORE UPDATE ON documento_vehiculo
  FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();


-- ============================================================
-- 6. ÍNDICES (IF NOT EXISTS, seguros)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_dv_vehiculo
  ON documento_vehiculo(vehiculo_id, tipo);

CREATE INDEX IF NOT EXISTS idx_dv_org_vence
  ON documento_vehiculo(org_id, vence_en ASC);


-- ============================================================
-- 7. RLS — reemplazar todas las políticas de documento_vehiculo
--    Las de rls_policies.sql (doc_select, doc_modificar) y las
--    de migración 07 (fallidas) se eliminan y se recrean limpias.
-- ============================================================

ALTER TABLE documento_vehiculo ENABLE ROW LEVEL SECURITY;

-- Políticas legacy de rls_policies.sql
DROP POLICY IF EXISTS doc_select    ON documento_vehiculo;
DROP POLICY IF EXISTS doc_modificar ON documento_vehiculo;

-- Políticas de migración 07 (posiblemente fallidas)
DROP POLICY IF EXISTS "dv: director todo" ON documento_vehiculo;
DROP POLICY IF EXISTS "dv: admin region"  ON documento_vehiculo;

-- Política de migración 08
DROP POLICY IF EXISTS "dv: superadmin todo" ON documento_vehiculo;

-- ── Crear políticas definitivas ──────────────────────────────

CREATE POLICY "dv: superadmin todo" ON documento_vehiculo
  TO authenticated
  USING (mydrive_es_superadmin());

CREATE POLICY "dv: director todo" ON documento_vehiculo
  TO authenticated
  USING     (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin())
  WITH CHECK (org_id = mydrive_org_id() AND mydrive_es_nacional());

CREATE POLICY "dv: admin region" ON documento_vehiculo
  TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND NOT mydrive_es_superadmin()
    AND EXISTS (
      SELECT 1 FROM vehiculo v
      WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id()
    )
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND EXISTS (
      SELECT 1 FROM vehiculo v
      WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id()
    )
  );

COMMENT ON TABLE documento_vehiculo IS
  'Documentos del vehículo (SOAT, tecno-mecánica, pólizas) con fecha de vencimiento. Alertar 30 días antes.';
