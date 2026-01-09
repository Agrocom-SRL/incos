-- ============================================
-- SEEDER: periodos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Periodos académicos por plan de estudios (3 años)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE periodos;

-- ============================================
-- INSERTAR PERIODOS POR PLAN DE ESTUDIOS
-- ============================================
-- Cada plan tiene 3 periodos (años académicos)

-- Obtener IDs de los planes de estudio
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1) LIMIT 1);
SET @plan_adm_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1) LIMIT 1);
SET @plan_con_id = (SELECT id FROM planes_estudios WHERE carrera_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1) LIMIT 1);

-- Primer Año (Periodo 1)
INSERT INTO periodos (plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(@plan_sis_id, 'Primer Año', 1, 1),
(@plan_adm_id, 'Primer Año', 1, 1),
(@plan_con_id, 'Primer Año', 1, 1);

-- Segundo Año (Periodo 2)
INSERT INTO periodos (plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(@plan_sis_id, 'Segundo Año', 2, 2),
(@plan_adm_id, 'Segundo Año', 2, 2),
(@plan_con_id, 'Segundo Año', 2, 2);

-- Tercer Año (Periodo 3)
INSERT INTO periodos (plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(@plan_sis_id, 'Tercer Año', 3, 3),
(@plan_adm_id, 'Tercer Año', 3, 3),
(@plan_con_id, 'Tercer Año', 3, 3);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
