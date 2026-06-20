-- ============================================================
-- Migración 06: Mantenimientos preventivos
-- Aplicar en: Supabase SQL Editor → Run
-- Fecha: 2026-06-20
-- ============================================================

CREATE TABLE IF NOT EXISTS mantenimiento_preventivo (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             uuid NOT NULL REFERENCES organizacion(id) ON DELETE CASCADE,
  vehiculo_id        uuid NOT NULL REFERENCES vehiculo(id)     ON DELETE CASCADE,
  tipo               text NOT NULL CHECK (tipo IN (
                       'aceite','frenos','llantas','filtros','revision_general','otro'
                     )),
  descripcion        text,
  kilometraje_alerta integer,
  fecha_programada   date         NOT NULL,
  fecha_realizada    date,
  estado             text NOT NULL DEFAULT 'pendiente' CHECK (
                       estado IN ('pendiente','completado','vencido')
                     ),
  observaciones      text,
  creado_por         uuid REFERENCES usuario(id),
  creado_en          timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

COMMENT ON TABLE mantenimiento_preventivo IS
  'Mantenimientos preventivos programados por vehículo (aceite, frenos, llantas, etc.)';

-- --------------------------------------------------------
-- RLS
-- --------------------------------------------------------
ALTER TABLE mantenimiento_preventivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mp: director todo" ON mantenimiento_preventivo
  TO authenticated
  USING     (org_id = mydrive_org_id() AND mydrive_es_nacional())
  WITH CHECK (org_id = mydrive_org_id() AND mydrive_es_nacional());

CREATE POLICY "mp: admin region" ON mantenimiento_preventivo
  TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND EXISTS (
      SELECT 1 FROM vehiculo v
      WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id()
    )
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND EXISTS (
      SELECT 1 FROM vehiculo v
      WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id()
    )
  );

CREATE POLICY "mp: conductor leer" ON mantenimiento_preventivo
  FOR SELECT TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND mydrive_rol() = 'conductor'
    AND EXISTS (
      SELECT 1 FROM asignacion a
      JOIN usuario u ON u.id = a.usuario_id
      WHERE a.vehiculo_id = mantenimiento_preventivo.vehiculo_id
        AND u.auth_id = auth.uid()
        AND a.hasta IS NULL
    )
  );

-- --------------------------------------------------------
-- Trigger updated_at
-- --------------------------------------------------------
CREATE TRIGGER trg_mp_updated_at
  BEFORE UPDATE ON mantenimiento_preventivo
  FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();

-- --------------------------------------------------------
-- Índices
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_mp_vehiculo_fecha
  ON mantenimiento_preventivo(vehiculo_id, fecha_programada ASC);

CREATE INDEX IF NOT EXISTS idx_mp_pendientes
  ON mantenimiento_preventivo(org_id, estado, fecha_programada)
  WHERE estado = 'pendiente';
