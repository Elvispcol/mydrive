-- ============================================================
-- MyDrive — Políticas RLS (ARCHIVO LEGACY — NO APLICAR)
-- ============================================================
-- ESTADO: DEPRECADO
--
-- Este archivo fue el mecanismo original para las políticas RLS
-- de las migraciones 01–04. A partir de la migración 06, cada
-- migración define sus propias políticas.
-- La migración 08 reemplazó todas las políticas de este archivo
-- con versiones que soportan superadmin y son más granulares.
-- La migración 09 reemplazó las políticas de documento_vehiculo.
--
-- Para un despliegue limpio desde cero, aplica SOLO las
-- migraciones en orden numérico (01–09). NO apliques este archivo.
--
-- Para consultar las políticas activas en tu BD:
--   SELECT tablename, policyname, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
-- ============================================================


-- ── ENABLE ROW LEVEL SECURITY ────────────────────────────────
-- Estas sentencias son idempotentes y seguras de re-ejecutar.
-- Las políticas están en las migraciones, no aquí.

ALTER TABLE organizacion              ENABLE ROW LEVEL SECURITY;
ALTER TABLE region                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documento_vehiculo        ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignacion                ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_plantilla       ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_item            ENABLE ROW LEVEL SECURITY;
ALTER TABLE preoperacional            ENABLE ROW LEVEL SECURITY;
ALTER TABLE preoperacional_respuesta  ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedad                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarea                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimiento             ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria                 ENABLE ROW LEVEL SECURITY;
