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
-- IDs fijos basados en el orden de los planes (1-3)
-- Cada plan tiene 3 periodos (años académicos)
-- ============================================
-- Plan 1 (SIS-INF): Periodos 1-3
-- Plan 2 (ADM-EMP): Periodos 4-6
-- Plan 3 (CON-GEN): Periodos 7-9

-- Plan 1 - Sistemas Informáticos: Primer Año (Periodo 1)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(1, 1, 'Primer Año', 1, 1);

-- Plan 1 - Sistemas Informáticos: Segundo Año (Periodo 2)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(2, 1, 'Segundo Año', 2, 2);

-- Plan 1 - Sistemas Informáticos: Tercer Año (Periodo 3)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(3, 1, 'Tercer Año', 3, 3);

-- Plan 2 - Administración de Empresas: Primer Año (Periodo 1)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(4, 2, 'Primer Año', 1, 1);

-- Plan 2 - Administración de Empresas: Segundo Año (Periodo 2)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(5, 2, 'Segundo Año', 2, 2);

-- Plan 2 - Administración de Empresas: Tercer Año (Periodo 3)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(6, 2, 'Tercer Año', 3, 3);

-- Plan 3 - Contaduría General: Primer Año (Periodo 1)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(7, 3, 'Primer Año', 1, 1);

-- Plan 3 - Contaduría General: Segundo Año (Periodo 2)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(8, 3, 'Segundo Año', 2, 2);

-- Plan 3 - Contaduría General: Tercer Año (Periodo 3)
INSERT INTO periodos (id, plan_estudio_id, nombre, numero, orden_visualizacion) VALUES
(9, 3, 'Tercer Año', 3, 3);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
