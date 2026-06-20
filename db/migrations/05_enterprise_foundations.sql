-- ============================================================
-- Migración 05: Fundaciones empresariales PMI
-- Aplicar en: Supabase SQL Editor → Run
-- Fecha: 2026-06-20
-- ============================================================

-- --------------------------------------------------------
-- 1. SOPORTE MULTI-PAÍS en organizacion
-- --------------------------------------------------------
ALTER TABLE organizacion
  ADD COLUMN IF NOT EXISTS pais_codigo   char(2)  DEFAULT 'CO',
  ADD COLUMN IF NOT EXISTS zona_horaria  text     DEFAULT 'America/Bogota',
  ADD COLUMN IF NOT EXISTS moneda        char(3)  DEFAULT 'COP',
  ADD COLUMN IF NOT EXISTS idioma        text     DEFAULT 'es';

COMMENT ON COLUMN organizacion.pais_codigo  IS 'ISO 3166-1 alpha-2 (CO, MX, BR, ES, US…)';
COMMENT ON COLUMN organizacion.zona_horaria IS 'IANA timezone (America/Bogota, Europe/Madrid…)';
COMMENT ON COLUMN organizacion.moneda       IS 'ISO 4217 currency code';
COMMENT ON COLUMN organizacion.idioma       IS 'BCP-47 locale code (es, en, pt, fr, de, it, ja)';

-- --------------------------------------------------------
-- 2. UPDATED_AT en todas las tablas
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION _touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Agregar columna updated_at y trigger por tabla
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizacion','region','usuario','vehiculo','asignacion',
    'checklist_plantilla','preoperacional','evento','novedad','tarea','mantenimiento'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()', t);
    EXECUTE format('
      CREATE OR REPLACE TRIGGER trg_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION _touch_updated_at()', t, t);
  END LOOP;
END;
$$;

-- --------------------------------------------------------
-- 3. SOFT DELETE en vehiculo (y extensible a otras tablas)
-- --------------------------------------------------------
ALTER TABLE vehiculo
  ADD COLUMN IF NOT EXISTS eliminado_en timestamptz DEFAULT NULL;

COMMENT ON COLUMN vehiculo.eliminado_en IS 'NULL = activo; timestamp = eliminado lógicamente';

-- Las políticas RLS ya filtran por org_id. Agregar filtro soft-delete
-- a las vistas/consultas usando: WHERE eliminado_en IS NULL

-- --------------------------------------------------------
-- 4. RPC ATÓMICA: crear_preoperacional
--    Crea preoperacional + todas sus respuestas en una sola transacción.
--    Reemplaza el flujo de 2 INSERT separados en ChecklistForm.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION crear_preoperacional(
  p_org_id       uuid,
  p_region_id    uuid,
  p_vehiculo_id  uuid,
  p_usuario_id   uuid,
  p_plantilla_id uuid,
  p_respuestas   jsonb   -- [{item_id, aprobado, nota}]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_preop_id  uuid;
  v_respuesta jsonb;
  v_resultado text := 'ok';
BEGIN
  -- Validar que el usuario pertenece a la organización
  IF NOT EXISTS (
    SELECT 1 FROM usuario
    WHERE id = p_usuario_id AND org_id = p_org_id AND activo = true
  ) THEN
    RAISE EXCEPTION 'usuario_no_autorizado';
  END IF;

  -- Insertar preoperacional
  INSERT INTO preoperacional (org_id, region_id, vehiculo_id, usuario_id, plantilla_id, resultado)
  VALUES (p_org_id, p_region_id, p_vehiculo_id, p_usuario_id, p_plantilla_id, 'ok')
  RETURNING id INTO v_preop_id;

  -- Insertar respuestas
  FOR v_respuesta IN SELECT * FROM jsonb_array_elements(p_respuestas)
  LOOP
    INSERT INTO preoperacional_respuesta (preoperacional_id, item_id, aprobado, nota)
    VALUES (
      v_preop_id,
      (v_respuesta->>'item_id')::uuid,
      (v_respuesta->>'aprobado')::boolean,
      nullif(trim(v_respuesta->>'nota'), '')
    );

    -- Marcar resultado si hay falla en ítem crítico
    IF (v_respuesta->>'aprobado')::boolean = false THEN
      IF EXISTS (
        SELECT 1 FROM checklist_item
        WHERE id = (v_respuesta->>'item_id')::uuid AND critico = true
      ) THEN
        v_resultado := 'con_novedades';
      END IF;
    END IF;
  END LOOP;

  -- Actualizar resultado final si hubo fallas críticas
  IF v_resultado = 'con_novedades' THEN
    UPDATE preoperacional SET resultado = 'con_novedades' WHERE id = v_preop_id;
  END IF;

  RETURN jsonb_build_object('preoperacional_id', v_preop_id, 'resultado', v_resultado);
END;
$$;

COMMENT ON FUNCTION crear_preoperacional IS
  'Crea preoperacional y respuestas atómicamente. Úsalo desde ChecklistForm vía supabase.rpc().';

-- --------------------------------------------------------
-- 5. ÍNDICES para consultas frecuentes de alta escala
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_novedad_estado_creado
  ON novedad(estado, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_novedad_org_estado
  ON novedad(org_id, estado, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_novedad_prioridad_estado
  ON novedad(prioridad, estado) WHERE eliminado_en IS NULL OR TRUE;

CREATE INDEX IF NOT EXISTS idx_tarea_estado_vence
  ON tarea(estado, vence_en ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_vehiculo_org_estado
  ON vehiculo(org_id, estado) WHERE eliminado_en IS NULL;

CREATE INDEX IF NOT EXISTS idx_preoperacional_vehiculo_fecha
  ON preoperacional(vehiculo_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_asignacion_usuario_activa
  ON asignacion(usuario_id) WHERE hasta IS NULL;

-- --------------------------------------------------------
-- 6. TABLA auditoria: agregar campo actor_pais
-- --------------------------------------------------------
ALTER TABLE auditoria
  ADD COLUMN IF NOT EXISTS actor_pais char(2);
