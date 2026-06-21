-- Migración 12: Corrige políticas que consultan asignacion directamente desde vehiculo
-- ============================================================
-- Problema residual de migración 11:
-- "veh: conductor su asig" consulta asignacion sin SECURITY DEFINER.
-- Las políticas de asignacion se evalúan y pueden llegar de vuelta a vehiculo.
-- Lo mismo ocurre en "mp: conductor leer" de mantenimiento_preventivo.
--
-- Solución: función SECURITY DEFINER que consulta asignacion sin activar su RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION mydrive_conductor_tiene_vehiculo(p_vehiculo_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM asignacion
    WHERE vehiculo_id = p_vehiculo_id
      AND usuario_id = (SELECT id FROM usuario WHERE auth_id = auth.uid() LIMIT 1)
      AND hasta IS NULL
  );
$$;

-- Corrige "veh: conductor su asig"
DROP POLICY IF EXISTS "veh: conductor su asig" ON vehiculo;
CREATE POLICY "veh: conductor su asig" ON vehiculo FOR SELECT TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND mydrive_rol() = 'conductor'
    AND mydrive_conductor_tiene_vehiculo(vehiculo.id)
    AND NOT mydrive_es_superadmin()
  );

-- Corrige "mp: conductor leer" (mismo patrón en mantenimiento_preventivo)
DROP POLICY IF EXISTS "mp: conductor leer" ON mantenimiento_preventivo;
CREATE POLICY "mp: conductor leer" ON mantenimiento_preventivo FOR SELECT TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND mydrive_rol() = 'conductor'
    AND mydrive_conductor_tiene_vehiculo(vehiculo_id)
  );
