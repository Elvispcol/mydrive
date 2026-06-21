-- ============================================================
-- MyDrive — Migración 10: Triggers de contexto organizacional
-- ============================================================
-- Problema: los formularios del frontend insertan filas sin
-- proporcionar org_id (columna NOT NULL). La RLS ya filtra por
-- org_id en SELECT/UPDATE/DELETE, pero no puede inferirlo en
-- INSERT automáticamente.
--
-- Solución: trigger BEFORE INSERT que llama a mydrive_org_id()
-- (SECURITY DEFINER) y rellena org_id si llega NULL.
--
-- region_id NO se auto-rellena aquí; los formularios que
-- requieren region_id (novedad, tarea, vehiculo) lo reciben
-- del selector de región en el front.
-- ============================================================


-- ============================================================
-- 1. FUNCIÓN genérica de contexto
-- ============================================================

CREATE OR REPLACE FUNCTION fn_ctx_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    NEW.org_id := mydrive_org_id();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_ctx_org IS
  'Trigger BEFORE INSERT: auto-rellena org_id desde el contexto del usuario autenticado.';


-- ============================================================
-- 2. APLICAR A LAS TABLAS CON org_id NOT NULL
--    Uso CREATE OR REPLACE TRIGGER (PG 14+) para ser idempotente
-- ============================================================

-- region
CREATE OR REPLACE TRIGGER ctx_org_region
  BEFORE INSERT ON region
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- vehiculo
CREATE OR REPLACE TRIGGER ctx_org_vehiculo
  BEFORE INSERT ON vehiculo
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- asignacion
CREATE OR REPLACE TRIGGER ctx_org_asignacion
  BEFORE INSERT ON asignacion
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- documento_vehiculo (corregida en migración 09)
CREATE OR REPLACE TRIGGER ctx_org_documento_vehiculo
  BEFORE INSERT ON documento_vehiculo
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- checklist_plantilla
CREATE OR REPLACE TRIGGER ctx_org_checklist_plantilla
  BEFORE INSERT ON checklist_plantilla
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- preoperacional
CREATE OR REPLACE TRIGGER ctx_org_preoperacional
  BEFORE INSERT ON preoperacional
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- evento
CREATE OR REPLACE TRIGGER ctx_org_evento
  BEFORE INSERT ON evento
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- novedad
CREATE OR REPLACE TRIGGER ctx_org_novedad
  BEFORE INSERT ON novedad
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- tarea
CREATE OR REPLACE TRIGGER ctx_org_tarea
  BEFORE INSERT ON tarea
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- mantenimiento
CREATE OR REPLACE TRIGGER ctx_org_mantenimiento
  BEFORE INSERT ON mantenimiento
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- mantenimiento_preventivo
CREATE OR REPLACE TRIGGER ctx_org_mantenimiento_preventivo
  BEFORE INSERT ON mantenimiento_preventivo
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- combustible
CREATE OR REPLACE TRIGGER ctx_org_combustible
  BEFORE INSERT ON combustible
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- multa_infraccion
CREATE OR REPLACE TRIGGER ctx_org_multa_infraccion
  BEFORE INSERT ON multa_infraccion
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();

-- taller_proveedor
CREATE OR REPLACE TRIGGER ctx_org_taller_proveedor
  BEFORE INSERT ON taller_proveedor
  FOR EACH ROW EXECUTE FUNCTION fn_ctx_org();
