-- ============================================================
-- MyDrive — Migración 08: Superadmin + RLS completo + Módulos
-- ============================================================
-- Aplica:
--   1. fn_auditoria mejorada (soporta tablas sin org_id)
--   2. Tabla plataforma_admin + mydrive_es_superadmin()
--   3. RLS en todas las tablas sin políticas (01-04)
--   4. Columnas de trazabilidad faltantes en tablas existentes
--   5. Tabla combustible
--   6. Tabla novedad_seguimiento
--   7. Tabla multa_infraccion
--   8. Tabla taller_proveedor
--   9. Tabla mantenimiento_item
--  10. Tabla contacto_emergencia
--  11. Vista v_superadmin_resumen
--  12. Auditoría en nuevas tablas
-- ============================================================


-- ============================================================
-- 1. fn_auditoria MEJORADA — usa jsonb para evitar error
--    en tablas que no tienen columna org_id
-- ============================================================

CREATE OR REPLACE FUNCTION fn_auditoria()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id  uuid;
  v_record_json jsonb;
BEGIN
  SELECT id INTO v_usuario_id
  FROM usuario WHERE auth_id = auth.uid() LIMIT 1;

  -- jsonb->>'campo' devuelve NULL si el campo no existe (safe)
  v_record_json := CASE WHEN tg_op = 'DELETE' THEN to_jsonb(old) ELSE to_jsonb(new) END;

  INSERT INTO auditoria(
    org_id, usuario_id, auth_id, accion, tabla, registro_id,
    datos_antes, datos_despues
  ) VALUES (
    (v_record_json->>'org_id')::uuid,
    v_usuario_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    v_record_json->>'id',
    CASE WHEN tg_op IN ('UPDATE','DELETE') THEN to_jsonb(old) ELSE NULL END,
    CASE WHEN tg_op IN ('INSERT','UPDATE') THEN to_jsonb(new) ELSE NULL END
  );

  RETURN CASE WHEN tg_op = 'DELETE' THEN old ELSE new END;
END;
$$;


-- ============================================================
-- 2. PLATAFORMA_ADMIN + mydrive_es_superadmin()
-- ============================================================

CREATE TABLE IF NOT EXISTS plataforma_admin (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id    uuid        NOT NULL UNIQUE,
  nombre     text        NOT NULL,
  email      text        NOT NULL,
  activo     boolean     NOT NULL DEFAULT true,
  creado_en  timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE plataforma_admin IS
  'Superadmins de la plataforma MyDrive. Acceso total a todas las organizaciones.';

CREATE TRIGGER trg_plataforma_admin_upd
  BEFORE UPDATE ON plataforma_admin
  FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();

ALTER TABLE plataforma_admin ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION mydrive_es_superadmin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM plataforma_admin
    WHERE auth_id = auth.uid() AND activo = true
  );
$$;

-- Solo superadmins ven esta tabla
CREATE POLICY "pa: solo superadmins" ON plataforma_admin
  TO authenticated
  USING (mydrive_es_superadmin());


-- ============================================================
-- 3. RLS EN TABLAS EXISTENTES SIN POLÍTICAS
-- ============================================================

-- 3.1 organizacion
ALTER TABLE organizacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org: superadmin todo"   ON organizacion TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "org: miembro ve la suya" ON organizacion TO authenticated
  USING (id = mydrive_org_id() AND NOT mydrive_es_superadmin());

-- 3.2 region
ALTER TABLE region ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg: superadmin todo"  ON region TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "reg: director su org"  ON region TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "reg: admin su region"  ON region TO authenticated
  USING (id = mydrive_region_id() AND NOT mydrive_es_superadmin());

-- 3.3 usuario
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usr: superadmin todo"      ON usuario TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "usr: director su org"      ON usuario TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "usr: admin su region"      ON usuario TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND (region_id = mydrive_region_id() OR auth_id = auth.uid())
    AND NOT mydrive_es_superadmin()
  );
CREATE POLICY "usr: conductor si mismo"   ON usuario FOR SELECT TO authenticated
  USING (auth_id = auth.uid() AND NOT mydrive_es_superadmin());

-- 3.4 vehiculo
ALTER TABLE vehiculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "veh: superadmin todo"     ON vehiculo TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "veh: director su org"     ON vehiculo TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "veh: admin su region"     ON vehiculo TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND region_id = mydrive_region_id()
    AND NOT mydrive_es_superadmin()
  );
CREATE POLICY "veh: conductor su asig"   ON vehiculo FOR SELECT TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND mydrive_rol() = 'conductor'
    AND EXISTS (
      SELECT 1 FROM asignacion a
      JOIN usuario u ON u.id = a.usuario_id
      WHERE a.vehiculo_id = vehiculo.id
        AND u.auth_id = auth.uid()
        AND a.hasta IS NULL
    )
    AND NOT mydrive_es_superadmin()
  );

-- 3.5 asignacion
ALTER TABLE asignacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asig: superadmin todo"   ON asignacion TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "asig: director su org"   ON asignacion TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "asig: admin su region"   ON asignacion TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND EXISTS (SELECT 1 FROM vehiculo v WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id())
    AND NOT mydrive_es_superadmin()
  );
CREATE POLICY "asig: conductor la suya" ON asignacion FOR SELECT TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND usuario_id = (SELECT id FROM usuario WHERE auth_id = auth.uid() LIMIT 1)
    AND NOT mydrive_es_superadmin()
  );

-- 3.6 checklist_plantilla
ALTER TABLE checklist_plantilla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp: superadmin todo"  ON checklist_plantilla TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "cp: miembros su org"  ON checklist_plantilla TO authenticated
  USING (org_id = mydrive_org_id() AND NOT mydrive_es_superadmin());

-- 3.7 checklist_item
ALTER TABLE checklist_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ci: superadmin todo"  ON checklist_item TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "ci: via plantilla"    ON checklist_item TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checklist_plantilla cp
      WHERE cp.id = plantilla_id AND cp.org_id = mydrive_org_id()
    )
    AND NOT mydrive_es_superadmin()
  );

-- 3.8 preoperacional
ALTER TABLE preoperacional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preop: superadmin todo"   ON preoperacional TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "preop: director su org"   ON preoperacional TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "preop: admin su region"   ON preoperacional TO authenticated
  USING (org_id = mydrive_org_id() AND region_id = mydrive_region_id() AND NOT mydrive_es_superadmin());
CREATE POLICY "preop: conductor los suyos" ON preoperacional TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND usuario_id = (SELECT id FROM usuario WHERE auth_id = auth.uid() LIMIT 1)
    AND NOT mydrive_es_superadmin()
  );

-- 3.9 preoperacional_respuesta
ALTER TABLE preoperacional_respuesta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pr: superadmin todo" ON preoperacional_respuesta TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "pr: via preoperacional" ON preoperacional_respuesta TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM preoperacional p
      WHERE p.id = preoperacional_id AND p.org_id = mydrive_org_id()
    )
    AND NOT mydrive_es_superadmin()
  );

-- 3.10 evento
ALTER TABLE evento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ev: superadmin todo"    ON evento TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "ev: director su org"    ON evento TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "ev: admin su region"    ON evento TO authenticated
  USING (org_id = mydrive_org_id() AND region_id = mydrive_region_id() AND NOT mydrive_es_superadmin());
CREATE POLICY "ev: conductor los suyos" ON evento TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND usuario_id = (SELECT id FROM usuario WHERE auth_id = auth.uid() LIMIT 1)
    AND NOT mydrive_es_superadmin()
  );

-- 3.11 novedad
ALTER TABLE novedad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nov: superadmin todo"  ON novedad TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "nov: director su org"  ON novedad TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "nov: admin su region"  ON novedad TO authenticated
  USING (org_id = mydrive_org_id() AND region_id = mydrive_region_id() AND NOT mydrive_es_superadmin());

-- 3.12 tarea
ALTER TABLE tarea ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tar: superadmin todo"  ON tarea TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "tar: director su org"  ON tarea TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "tar: admin su region"  ON tarea TO authenticated
  USING (org_id = mydrive_org_id() AND region_id = mydrive_region_id() AND NOT mydrive_es_superadmin());

-- 3.13 mantenimiento
ALTER TABLE mantenimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mant: superadmin todo"  ON mantenimiento TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "mant: director su org"  ON mantenimiento TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "mant: admin su region"  ON mantenimiento TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND EXISTS (SELECT 1 FROM vehiculo v WHERE v.id = vehiculo_id AND v.region_id = mydrive_region_id())
    AND NOT mydrive_es_superadmin()
  );

-- Superadmin también en tabla de mantenimiento_preventivo (migración 06)
CREATE POLICY "mp: superadmin todo" ON mantenimiento_preventivo TO authenticated
  USING (mydrive_es_superadmin());

-- Superadmin también en documento_vehiculo (migración 07)
CREATE POLICY "dv: superadmin todo" ON documento_vehiculo TO authenticated
  USING (mydrive_es_superadmin());


-- ============================================================
-- 4. COLUMNAS DE TRAZABILIDAD EN TABLAS EXISTENTES
-- ============================================================

ALTER TABLE vehiculo
  ADD COLUMN IF NOT EXISTS color           text,
  ADD COLUMN IF NOT EXISTS cilindraje      integer,
  ADD COLUMN IF NOT EXISTS numero_motor    text,
  ADD COLUMN IF NOT EXISTS numero_chasis   text,
  ADD COLUMN IF NOT EXISTS km_actual       integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creado_por      uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS actualizado_por uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS retiro_motivo   text,
  ADD COLUMN IF NOT EXISTS retiro_fecha    date;

ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS creado_por      uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS actualizado_por uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS fecha_ingreso   date,
  ADD COLUMN IF NOT EXISTS fecha_retiro    date,
  ADD COLUMN IF NOT EXISTS motivo_retiro   text;

ALTER TABLE novedad
  ADD COLUMN IF NOT EXISTS asignado_a    uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS resuelto_por  uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS resuelto_en   timestamptz,
  ADD COLUMN IF NOT EXISTS adjunto_url   text,
  ADD COLUMN IF NOT EXISTS eliminado_en  timestamptz;

ALTER TABLE mantenimiento
  ADD COLUMN IF NOT EXISTS estado         text NOT NULL DEFAULT 'programado'
    CHECK (estado IN ('programado','en_proceso','completado','cancelado')),
  ADD COLUMN IF NOT EXISTS km_en_servicio integer,
  ADD COLUMN IF NOT EXISTS completado_en  date,
  ADD COLUMN IF NOT EXISTS completado_por uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS creado_por     uuid REFERENCES usuario(id),
  ADD COLUMN IF NOT EXISTS eliminado_en   timestamptz;

ALTER TABLE asignacion
  ADD COLUMN IF NOT EXISTS creado_por uuid REFERENCES usuario(id);


-- ============================================================
-- 5. TABLA combustible
-- ============================================================

CREATE TABLE IF NOT EXISTS combustible (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid         NOT NULL REFERENCES organizacion(id) ON DELETE RESTRICT,
  region_id        uuid         NOT NULL REFERENCES region(id)       ON DELETE RESTRICT,
  vehiculo_id      uuid         NOT NULL REFERENCES vehiculo(id)     ON DELETE RESTRICT,
  conductor_id     uuid         NOT NULL REFERENCES usuario(id)      ON DELETE RESTRICT,
  fecha            timestamptz  NOT NULL DEFAULT now(),
  km_odometro      integer      NOT NULL,
  litros           numeric(8,3) NOT NULL CHECK (litros > 0),
  costo_litro      numeric(10,2),
  costo_total      numeric(12,2),
  tipo_combustible text         NOT NULL DEFAULT 'gasolina'
                   CHECK (tipo_combustible IN ('gasolina','diesel','gas_natural','electrico','hibrido')),
  estacion         text,
  numero_factura   text,
  observaciones    text,
  creado_por       uuid         REFERENCES usuario(id),
  creado_en        timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  DEFAULT now()
);

COMMENT ON TABLE combustible IS
  'Registro de abastecimiento. Permite calcular consumo km/litro por vehículo.';

ALTER TABLE combustible ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comb: superadmin todo"    ON combustible TO authenticated USING (mydrive_es_superadmin());
CREATE POLICY "comb: director su org"    ON combustible TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "comb: admin su region"    ON combustible TO authenticated
  USING (org_id = mydrive_org_id() AND region_id = mydrive_region_id() AND NOT mydrive_es_superadmin());
CREATE POLICY "comb: conductor los suyos" ON combustible TO authenticated
  USING (
    org_id = mydrive_org_id()
    AND conductor_id = (SELECT id FROM usuario WHERE auth_id = auth.uid() LIMIT 1)
    AND NOT mydrive_es_superadmin()
  );

CREATE TRIGGER trg_combustible_upd
  BEFORE UPDATE ON combustible FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();
CREATE TRIGGER aud_combustible
  AFTER INSERT OR UPDATE OR DELETE ON combustible FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

CREATE INDEX IF NOT EXISTS idx_comb_vehiculo_fecha ON combustible(vehiculo_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_comb_org_fecha      ON combustible(org_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_comb_conductor      ON combustible(conductor_id);


-- ============================================================
-- 6. TABLA novedad_seguimiento
-- ============================================================

CREATE TABLE IF NOT EXISTS novedad_seguimiento (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  novedad_id   uuid        NOT NULL REFERENCES novedad(id) ON DELETE CASCADE,
  usuario_id   uuid        NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
  accion       text        NOT NULL,
  descripcion  text,
  estado_nuevo text        CHECK (estado_nuevo IN ('abierta','en_proceso','cerrada')),
  adjunto_url  text,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE novedad_seguimiento IS
  'Historial cronológico de acciones sobre cada novedad. Trazabilidad completa.';

ALTER TABLE novedad_seguimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ns: superadmin todo" ON novedad_seguimiento TO authenticated
  USING (mydrive_es_superadmin());
CREATE POLICY "ns: via novedad"     ON novedad_seguimiento TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM novedad n WHERE n.id = novedad_id AND n.org_id = mydrive_org_id()
    )
    AND NOT mydrive_es_superadmin()
  );

CREATE TRIGGER aud_novedad_seguimiento
  AFTER INSERT OR UPDATE OR DELETE ON novedad_seguimiento
  FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

CREATE INDEX IF NOT EXISTS idx_ns_novedad ON novedad_seguimiento(novedad_id, creado_en DESC);


-- ============================================================
-- 7. TABLA multa_infraccion
-- ============================================================

CREATE TABLE IF NOT EXISTS multa_infraccion (
  id                     uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                 uuid         NOT NULL REFERENCES organizacion(id) ON DELETE RESTRICT,
  region_id              uuid         NOT NULL REFERENCES region(id)       ON DELETE RESTRICT,
  vehiculo_id            uuid         NOT NULL REFERENCES vehiculo(id)     ON DELETE RESTRICT,
  conductor_id           uuid         REFERENCES usuario(id) ON DELETE SET NULL,
  fecha_infraccion       date         NOT NULL,
  fecha_notificacion     date,
  tipo                   text         NOT NULL
                         CHECK (tipo IN ('velocidad','senales','estacionamiento','documentos','alcoholemia','otro')),
  descripcion            text,
  valor                  numeric(12,2),
  descuento_pronto_pago  numeric(12,2),
  fecha_limite_pago      date,
  estado                 text         NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente','en_disputa','pagada','exonerada','vencida')),
  pagado_por             uuid         REFERENCES usuario(id),
  fecha_pago             date,
  comprobante_url        text,
  observaciones          text,
  creado_por             uuid         REFERENCES usuario(id),
  creado_en              timestamptz  NOT NULL DEFAULT now(),
  updated_at             timestamptz  DEFAULT now()
);

COMMENT ON TABLE multa_infraccion IS
  'Multas e infracciones de tránsito. Seguimiento de estado de pago y disputas.';

ALTER TABLE multa_infraccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mul: superadmin todo"  ON multa_infraccion TO authenticated USING (mydrive_es_superadmin());
CREATE POLICY "mul: director su org"  ON multa_infraccion TO authenticated
  USING (org_id = mydrive_org_id() AND mydrive_es_nacional() AND NOT mydrive_es_superadmin());
CREATE POLICY "mul: admin su region"  ON multa_infraccion TO authenticated
  USING (org_id = mydrive_org_id() AND region_id = mydrive_region_id() AND NOT mydrive_es_superadmin());

CREATE TRIGGER trg_multa_upd
  BEFORE UPDATE ON multa_infraccion FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();
CREATE TRIGGER aud_multa_infraccion
  AFTER INSERT OR UPDATE OR DELETE ON multa_infraccion FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

CREATE INDEX IF NOT EXISTS idx_multa_vehiculo  ON multa_infraccion(vehiculo_id, fecha_infraccion DESC);
CREATE INDEX IF NOT EXISTS idx_multa_org_estado ON multa_infraccion(org_id, estado);
CREATE INDEX IF NOT EXISTS idx_multa_vence     ON multa_infraccion(fecha_limite_pago) WHERE estado = 'pendiente';


-- ============================================================
-- 8. TABLA taller_proveedor
-- ============================================================

CREATE TABLE IF NOT EXISTS taller_proveedor (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid        NOT NULL REFERENCES organizacion(id) ON DELETE RESTRICT,
  nombre          text        NOT NULL,
  nit             text,
  tipo            text        NOT NULL DEFAULT 'taller_mecanico'
                  CHECK (tipo IN ('taller_mecanico','electricista','llantas','carroceria','combustible','seguros','otro')),
  telefono        text,
  email           text,
  direccion       text,
  ciudad          text,
  contacto_nombre text,
  activo          boolean     NOT NULL DEFAULT true,
  creado_por      uuid        REFERENCES usuario(id),
  creado_en       timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE taller_proveedor IS
  'Catálogo de talleres y proveedores de servicios vehiculares por organización.';

ALTER TABLE taller_proveedor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tp: superadmin todo" ON taller_proveedor TO authenticated USING (mydrive_es_superadmin());
CREATE POLICY "tp: miembros su org" ON taller_proveedor TO authenticated
  USING (org_id = mydrive_org_id() AND NOT mydrive_es_superadmin());

CREATE TRIGGER trg_taller_upd
  BEFORE UPDATE ON taller_proveedor FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();
CREATE TRIGGER aud_taller_proveedor
  AFTER INSERT OR UPDATE OR DELETE ON taller_proveedor FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

CREATE INDEX IF NOT EXISTS idx_taller_org   ON taller_proveedor(org_id, tipo);
CREATE INDEX IF NOT EXISTS idx_taller_activo ON taller_proveedor(org_id) WHERE activo = true;


-- ============================================================
-- 9. TABLA mantenimiento_item
-- ============================================================

CREATE TABLE IF NOT EXISTS mantenimiento_item (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  mantenimiento_id uuid         NOT NULL REFERENCES mantenimiento(id) ON DELETE CASCADE,
  descripcion      text         NOT NULL,
  tipo_trabajo     text         CHECK (tipo_trabajo IN ('mano_obra','repuesto','insumo','revision','otro')),
  cantidad         numeric(8,2) DEFAULT 1,
  costo_unitario   numeric(12,2),
  costo_total      numeric(12,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
  proveedor_id     uuid         REFERENCES taller_proveedor(id) ON DELETE SET NULL,
  numero_factura   text,
  observaciones    text,
  creado_en        timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE mantenimiento_item IS
  'Ítems detallados de cada mantenimiento: repuestos, mano de obra, insumos.';

ALTER TABLE mantenimiento_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mi: superadmin todo"  ON mantenimiento_item TO authenticated USING (mydrive_es_superadmin());
CREATE POLICY "mi: via mantenimiento" ON mantenimiento_item TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mantenimiento m WHERE m.id = mantenimiento_id AND m.org_id = mydrive_org_id()
    )
    AND NOT mydrive_es_superadmin()
  );

CREATE INDEX IF NOT EXISTS idx_mi_mantenimiento ON mantenimiento_item(mantenimiento_id);


-- ============================================================
-- 10. TABLA contacto_emergencia
-- ============================================================

CREATE TABLE IF NOT EXISTS contacto_emergencia (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    uuid        NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nombre        text        NOT NULL,
  parentesco    text,
  telefono      text        NOT NULL,
  telefono_alt  text,
  email         text,
  es_principal  boolean     NOT NULL DEFAULT false,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE contacto_emergencia IS
  'Contactos de emergencia de cada empleado. Mínimo uno por conductor activo.';

ALTER TABLE contacto_emergencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ce: superadmin todo"   ON contacto_emergencia TO authenticated USING (mydrive_es_superadmin());
CREATE POLICY "ce: director su org"   ON contacto_emergencia TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuario u WHERE u.id = usuario_id AND u.org_id = mydrive_org_id())
    AND mydrive_es_nacional() AND NOT mydrive_es_superadmin()
  );
CREATE POLICY "ce: admin su region"   ON contacto_emergencia TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario u
      WHERE u.id = usuario_id AND u.org_id = mydrive_org_id() AND u.region_id = mydrive_region_id()
    )
    AND NOT mydrive_es_superadmin()
  );
CREATE POLICY "ce: conductor los suyos" ON contacto_emergencia FOR SELECT TO authenticated
  USING (
    usuario_id = (SELECT id FROM usuario WHERE auth_id = auth.uid() LIMIT 1)
    AND NOT mydrive_es_superadmin()
  );

CREATE TRIGGER trg_ce_upd
  BEFORE UPDATE ON contacto_emergencia FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_ce_usuario ON contacto_emergencia(usuario_id);


-- ============================================================
-- 11. VISTA GLOBAL SUPERADMIN
-- ============================================================

CREATE OR REPLACE VIEW v_superadmin_resumen AS
SELECT
  o.id                                                                      AS org_id,
  o.nombre                                                                  AS organizacion,
  o.pais_codigo,
  o.plan_licencia,
  o.activo,
  COUNT(DISTINCT u.id)  FILTER (WHERE u.activo = true)                      AS usuarios_activos,
  COUNT(DISTINCT v.id)  FILTER (WHERE v.estado = 'activo'
                                  AND v.eliminado_en IS NULL)               AS vehiculos_activos,
  COUNT(DISTINCT mp.id) FILTER (WHERE mp.estado = 'pendiente')              AS mantenimientos_pendientes,
  COUNT(DISTINCT n.id)  FILTER (WHERE n.estado != 'cerrada')                AS novedades_abiertas,
  COUNT(DISTINCT c.id)  FILTER (WHERE c.fecha >= now() - interval '30 days') AS repostajes_30d,
  o.creado_en
FROM organizacion o
LEFT JOIN usuario               u   ON u.org_id   = o.id
LEFT JOIN vehiculo              v   ON v.org_id   = o.id
LEFT JOIN mantenimiento_preventivo mp ON mp.org_id = o.id
LEFT JOIN novedad               n   ON n.org_id   = o.id
LEFT JOIN combustible           c   ON c.org_id   = o.id
GROUP BY o.id, o.nombre, o.pais_codigo, o.plan_licencia, o.activo, o.creado_en
ORDER BY o.nombre;

COMMENT ON VIEW v_superadmin_resumen IS
  'Métricas globales por organización. Exclusivo para superadmins de la plataforma.';
