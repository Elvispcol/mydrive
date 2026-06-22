-- ============================================================
-- MyDrive — Seed de demo: Empresa PM
-- ============================================================
-- Ejecutar UNA SOLA VEZ después de aplicar todas las migraciones.
-- Requiere que los usuarios y vehículos base ya existan en la BD.
--
-- Org PM:       f3029040-6aba-4e94-83f0-1064f5a1ffd7
-- Región Caribe: ab99becf-7586-4988-a354-5d6a470377ea
-- KLM-321:      d0e78a9f-6120-4917-9ea4-a09fa0bed120
-- OPQ-845:      a03d8ab0-e86d-4088-8967-50beff926c9c
-- Elvis:        d1a55ff0-e411-4f51-bf62-ad7d8055a8fb
-- Alexander:    ba50de93-6ef9-4cce-8fcb-7d63c6e525bc
-- Juan Pérez:   b7c94eb0-7299-4bc6-9311-cf1f96d9c577
-- ============================================================

-- 1. Perfiles completos de todos los usuarios
UPDATE usuario SET
  documento = '1002847593', celular = '3102345678',
  ciudad = 'Bogotá', cargo = 'Director General', fecha_ingreso = '2024-01-15'
WHERE id = 'd1a55ff0-e411-4f51-bf62-ad7d8055a8fb';

UPDATE usuario SET
  documento = '23456789', celular = '3156789012',
  ciudad = 'Barranquilla', cargo = 'Directora de Operaciones', fecha_ingreso = '2024-02-01'
WHERE id = '63f6e198-05d8-4423-ac09-b588f7744b98';

UPDATE usuario SET
  documento = '34567890', celular = '3214567890',
  ciudad = 'Barranquilla', cargo = 'Administrador Regional Caribe', fecha_ingreso = '2024-03-15'
WHERE id = 'ba50de93-6ef9-4cce-8fcb-7d63c6e525bc';

UPDATE usuario SET
  documento = '1098765432', celular = '3005678901',
  ciudad = 'Barranquilla', cargo = 'Conductor de Carga',
  tipo_licencia = 'C2', licencia_expedicion = '2020-03-10',
  licencia_vencimiento = '2027-03-10', fecha_ingreso = '2024-04-01'
WHERE id = 'b7c94eb0-7299-4bc6-9311-cf1f96d9c577';

-- 2. Datos operacionales
DO $$
DECLARE
  v_org uuid := 'f3029040-6aba-4e94-83f0-1064f5a1ffd7';
  v_caribe uuid := 'ab99becf-7586-4988-a354-5d6a470377ea';
  v_klm uuid := 'd0e78a9f-6120-4917-9ea4-a09fa0bed120';
  v_opq uuid := 'a03d8ab0-e86d-4088-8967-50beff926c9c';
  v_elvis uuid := 'd1a55ff0-e411-4f51-bf62-ad7d8055a8fb';
  v_alexander uuid := 'ba50de93-6ef9-4cce-8fcb-7d63c6e525bc';
  v_juan uuid := 'b7c94eb0-7299-4bc6-9311-cf1f96d9c577';
  nov1_id uuid;
  nov2_id uuid;
BEGIN
  nov1_id := gen_random_uuid();
  nov2_id := gen_random_uuid();

  INSERT INTO asignacion (org_id, vehiculo_id, usuario_id, desde, creado_por)
  VALUES (v_org, v_klm, v_juan, CURRENT_DATE - 30, v_elvis);

  INSERT INTO novedad (id, org_id, region_id, vehiculo_id, origen_tipo, titulo, descripcion, prioridad, estado, creado_en)
  VALUES
    (nov1_id, v_org, v_caribe, v_klm, 'conductor', 'Falla en frenos traseros', 'Conductor reporto sensacion reducida de frenado en rueda trasera derecha. Requiere revision urgente.', 'critica', 'abierta', NOW() - INTERVAL '2 days'),
    (nov2_id, v_org, v_caribe, v_klm, 'preoperacional', 'Luz de presion de aceite activa', 'Indicador de presion de aceite se activo durante inspeccion preoperacional matutina.', 'alta', 'en_proceso', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_org, v_caribe, v_opq, 'inspector', 'Desgaste de llantas delanteras', 'Llantas delanteras muestran desgaste irregular. Verificar alineacion y balanceo.', 'media', 'abierta', NOW() - INTERVAL '1 day');

  INSERT INTO tarea (org_id, region_id, novedad_id, titulo, descripcion, asignado_a, prioridad, vence_en, creado_por)
  VALUES
    (v_org, v_caribe, nov1_id, 'Revision frenos KLM-321', 'Llevar KLM-321 al taller para revision urgente de frenos traseros.', v_alexander, 'critica', CURRENT_DATE + 2, v_elvis),
    (v_org, v_caribe, nov2_id, 'Cambio de aceite KLM-321', 'Programar cambio de aceite y revision sistema de lubricacion.', v_alexander, 'alta', CURRENT_DATE + 5, v_elvis),
    (v_org, v_caribe, NULL, 'Documentacion OPQ-845', 'Verificar vencimiento SOAT y revision tecnico-mecanica OPQ-845.', v_alexander, 'media', CURRENT_DATE + 15, v_elvis);

  INSERT INTO combustible (org_id, region_id, vehiculo_id, conductor_id, fecha, km_odometro, litros, costo_litro, costo_total, tipo_combustible, estacion, creado_por)
  VALUES
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 3,  45820, 80.5, 5200.00, 418600.00, 'diesel', 'EDS Terpel Barranquilla Centro', v_elvis),
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 10, 45650, 75.0, 5200.00, 390000.00, 'diesel', 'EDS Primax Cartagena', v_elvis),
    (v_org, v_caribe, v_opq, v_juan, CURRENT_DATE - 7,  32100, 65.0, 5200.00, 338000.00, 'diesel', 'EDS Biomax Santa Marta', v_elvis);

  INSERT INTO multa_infraccion (org_id, region_id, vehiculo_id, conductor_id, fecha_infraccion, tipo, descripcion, valor, estado, fecha_limite_pago, creado_por)
  VALUES
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 15, 'velocidad',      'Exceso de velocidad 30 km/h sobre limite. Autopista Norte, Barranquilla.', 580000.00, 'pendiente', CURRENT_DATE + 45, v_elvis),
    (v_org, v_caribe, v_opq, v_juan, CURRENT_DATE - 45, 'estacionamiento', 'Vehiculo en zona prohibida. Zona industrial de Barranquilla.',              150000.00, 'pagada',    NULL,              v_elvis);

  INSERT INTO mantenimiento (org_id, vehiculo_id, tipo, descripcion, costo, fecha, estado, creado_por)
  VALUES
    (v_org, v_klm, 'correctivo', 'Cambio de bateria y revision de alternador.',        350000.00, CURRENT_DATE - 20, 'completado', v_elvis),
    (v_org, v_opq, 'preventivo', 'Cambio de aceite y filtros. Revision de fluidos.',   280000.00, CURRENT_DATE + 10, 'programado', v_elvis);

  INSERT INTO preoperacional (org_id, region_id, vehiculo_id, usuario_id, fecha, resultado, observacion)
  VALUES
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE,     'ok',           NULL),
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 1, 'con_novedades','Se detecto fuga menor de aceite en carter. Requiere atencion.'),
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 2, 'ok',           NULL),
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 3, 'ok',           NULL),
    (v_org, v_caribe, v_klm, v_juan, CURRENT_DATE - 4, 'ok',           NULL);
END;
$$;
