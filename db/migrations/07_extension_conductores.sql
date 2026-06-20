-- ============================================================
-- Migración 07: Extensión datos operacionales de flota
-- Aplicar en: Supabase SQL Editor → Run
-- Fecha: 2026-06-20
-- ============================================================

-- --------------------------------------------------------
-- 1. EXTENSIÓN TABLA USUARIO — datos del conductor
-- --------------------------------------------------------
ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS celular              text,
  ADD COLUMN IF NOT EXISTS ciudad               text,
  ADD COLUMN IF NOT EXISTS cargo                text,
  ADD COLUMN IF NOT EXISTS tipo_licencia        text CHECK (
    tipo_licencia IS NULL OR tipo_licencia IN ('A1','A2','B1','B2','B3','C1','C2','C3')
  ),
  ADD COLUMN IF NOT EXISTS licencia_expedicion  date,
  ADD COLUMN IF NOT EXISTS licencia_vencimiento date,
  ADD COLUMN IF NOT EXISTS foto_url             text;

COMMENT ON COLUMN usuario.tipo_licencia        IS 'Categoría de licencia de conducción (A1-C3)';
COMMENT ON COLUMN usuario.licencia_vencimiento IS 'Fecha de vencimiento de la licencia — alertar 30 días antes';

-- --------------------------------------------------------
-- 2. EXTENSIÓN TABLA ASIGNACION — tipo de asignación
-- --------------------------------------------------------
ALTER TABLE asignacion
  ADD COLUMN IF NOT EXISTS tipo_asignacion text DEFAULT 'herramienta_trabajo' CHECK (
    tipo_asignacion IN ('beneficio','herramienta_trabajo','seguridad','representacion','otro')
  );

COMMENT ON COLUMN asignacion.tipo_asignacion IS
  'beneficio=uso personal, herramienta_trabajo=uso laboral, seguridad=escolta/protección';

-- --------------------------------------------------------
-- 3. TABLA documento_vehiculo
--    SOAT, tecno-mecánica, pólizas, tarjeta operación
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS documento_vehiculo (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizacion(id) ON DELETE CASCADE,
  vehiculo_id   uuid NOT NULL REFERENCES vehiculo(id)     ON DELETE CASCADE,
  tipo          text NOT NULL CHECK (tipo IN (
                  'soat','tecnomecanica','poliza_rc',
                  'poliza_todo_riesgo','tarjeta_operacion','otro'
                )),
  numero        text,
  vencimiento   date NOT NULL,
  archivo_url   text,
  observaciones text,
  creado_por    uuid REFERENCES usuario(id),
  creado_en     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE documento_vehiculo IS
  'Documentos del vehículo con fecha de vencimiento. Alertar 30 días antes.';

ALTER TABLE documento_vehiculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dv: director todo" ON documento_vehiculo
  TO authenticated
  USING     (org_id = mydrive_org_id() AND mydrive_es_nacional())
  WITH CHECK (org_id = mydrive_org_id() AND mydrive_es_nacional());

CREATE POLICY "dv: admin region" ON documento_vehiculo
  TO authenticated
  USING (
    org_id = mydrive_org_id() AND NOT mydrive_es_nacional()
    AND EXISTS (
      SELECT 1 FROM vehiculo v WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id()
    )
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND EXISTS (
      SELECT 1 FROM vehiculo v WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id()
    )
  );

CREATE TRIGGER trg_dv_updated_at
  BEFORE UPDATE ON documento_vehiculo
  FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_dv_vehiculo      ON documento_vehiculo(vehiculo_id, tipo);
CREATE INDEX IF NOT EXISTS idx_dv_vencimiento   ON documento_vehiculo(org_id, vencimiento ASC);

-- --------------------------------------------------------
-- 4. ÍNDICE para alertas de licencia
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuario_licencia_vencimiento
  ON usuario(org_id, licencia_vencimiento ASC)
  WHERE licencia_vencimiento IS NOT NULL AND activo = true;
