-- Migración 11: Corrige recursión infinita en políticas RLS
-- ============================================================
-- PROBLEMA: Bucle circular entre vehiculo ↔ asignacion en RLS
--   "veh: conductor su asig"  → subquery a asignacion
--   "asig: admin su region"   → subquery a vehiculo  ← bucle
-- Lo mismo ocurre en mantenimiento, mantenimiento_preventivo y documento_vehiculo.
--
-- SOLUCIÓN: función SECURITY DEFINER que consulta vehiculo sin aplicar su RLS,
-- rompiendo la dependencia circular.
-- ============================================================

-- 1. Función auxiliar que chequea region sin activar RLS de vehiculo
CREATE OR REPLACE FUNCTION mydrive_vehiculo_en_mi_region(p_vehiculo_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM vehiculo
    WHERE id = p_vehiculo_id
      AND region_id = mydrive_region_id()
  );
$$;

-- 2. asignacion: "asig: admin su region" usaba EXISTS (...FROM vehiculo...)
DROP POLICY IF EXISTS "asig: admin su region" ON asignacion;
CREATE POLICY "asig: admin su region" ON asignacion TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
    AND NOT mydrive_es_superadmin()
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  );

-- 3. mantenimiento: "mant: admin su region" usaba EXISTS (...FROM vehiculo...)
DROP POLICY IF EXISTS "mant: admin su region" ON mantenimiento;
CREATE POLICY "mant: admin su region" ON mantenimiento TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
    AND NOT mydrive_es_superadmin()
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  );

-- 4. mantenimiento_preventivo: "mp: admin region" usaba EXISTS (...FROM vehiculo...)
DROP POLICY IF EXISTS "mp: admin region" ON mantenimiento_preventivo;
CREATE POLICY "mp: admin region" ON mantenimiento_preventivo TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  )
  WITH CHECK (
    org_id = mydrive_org_id()
    AND NOT mydrive_es_nacional()
    AND mydrive_vehiculo_en_mi_region(vehiculo_id)
  );

-- 5. documento_vehiculo: "dv: admin region" usaba EXISTS (...FROM vehiculo...)
DROP POLICY IF EXISTS "dv: admin region" ON documento_vehiculo;
CREATE POLICY "dv: admin region" ON documento_vehiculo TO authenticated
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
