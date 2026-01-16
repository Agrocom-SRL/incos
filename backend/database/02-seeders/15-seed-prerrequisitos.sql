-- ============================================
-- SEEDER: prerrequisitos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Prerrequisitos entre asignaturas según Plan de Estudios RM No. 0210/2023
-- IDs fijos basados en los IDs de asignaturas_plan
-- ============================================
-- Orden: Plan 1 (SIS-INF), Plan 2 (ADM-EMP), Plan 3 (CON-GEN)
-- Dentro de cada plan, ordenados por periodo de la asignatura

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE prerrequisitos;

-- ============================================
-- INSERTAR PRERREQUISITOS
-- ============================================

-- ============================================
-- SISTEMAS INFORMÁTICOS (Plan 1)
-- ============================================

-- Periodo 2: Programación II (asignatura_id = 9) requiere Programación I (prerrequisito_id = 2) - Periodo 1
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(1, 1, 9, 2);

-- Periodo 2: Diseño y Programación Web II (asignatura_id = 14) requiere Diseño y Programación Web I (prerrequisito_id = 7) - Periodo 1
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(2, 1, 14, 7);

-- Periodo 3: Diseño y Programación Web III (asignatura_id = 17) requiere Diseño y Programación Web II (prerrequisito_id = 14) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(3, 1, 17, 14);

-- Periodo 3: Redes de Computadoras II (asignatura_id = 19) requiere Redes de Computadoras I (prerrequisito_id = 11) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(4, 1, 19, 11);

-- Periodo 3: Programación para Dispositivos Móviles II (asignatura_id = 22) requiere Programación para Dispositivos Móviles I (prerrequisito_id = 12) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(5, 1, 22, 12);

-- Periodo 3: Análisis y Diseño de Sistemas II (asignatura_id = 21) requiere Análisis y Diseño de Sistemas I (prerrequisito_id = 13) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(6, 1, 21, 13);

-- Periodo 3: Base de Datos II (asignatura_id = 23) requiere Base de Datos I (prerrequisito_id = 15) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(7, 1, 23, 15);

-- ============================================
-- ADMINISTRACIÓN DE EMPRESAS (Plan 2)
-- ============================================

-- Periodo 2: Administración Financiera I (asignatura_id = 35) requiere Matemática Financiera (prerrequisito_id = 26) - Periodo 1
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(8, 2, 35, 26);

-- Periodo 2: Administración de Costos y Presupuestos (asignatura_id = 37) requiere Contabilidad General para Administraciones (prerrequisito_id = 25) - Periodo 1
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(9, 2, 37, 25);

-- Periodo 3: Administración Financiera II (asignatura_id = 41) requiere Administración Financiera I (prerrequisito_id = 35) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(10, 2, 41, 35);

-- ============================================
-- CONTADURÍA GENERAL (Plan 3)
-- ============================================

-- Periodo 2: Contabilidad II (asignatura_id = 55) requiere Contabilidad I (prerrequisito_id = 46) - Periodo 1
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(11, 3, 55, 46);

-- Periodo 3: Contabilidad de Costos II (asignatura_id = 63) requiere Contabilidad de Costos I (prerrequisito_id = 56) - Periodo 2
INSERT INTO prerrequisitos (id, plan_estudio_id, asignatura_id, prerrequisito_id) VALUES
(12, 3, 63, 56);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
