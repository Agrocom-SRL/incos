-- ============================================
-- SEEDER: periodos_academicos
-- Sistema de Gestión Académica - Instituto INCOS
-- Periodos académicos de las Gestiones 2025 y 2026
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE periodos_academicos;

-- ============================================
-- INSERTAR PERIODOS ACADÉMICOS 2025
-- Estructura: Planificación + 4 Bimestres + Clausura
-- IDs: 1-6
-- ============================================

INSERT INTO periodos_academicos (id, gestion_id, codigo, nombre, division, numero_orden, fecha_inicio, fecha_fin, color_hex) VALUES
-- Periodo de Planificación (antes de iniciar clases)
(1, 1, '2025-PLAN', 'Inscripción y Planificación', 'PLANIFICACION', NULL, '2025-01-13', '2025-02-21', '#4CAF50'),

-- Primer Bimestre
(2, 1, '2025-BIM1', 'Primer Bimestre', 'BIMESTRE', 1, '2025-02-10', '2025-04-28', '#2196F3'),

-- Segundo Bimestre
(3, 1, '2025-BIM2', 'Segundo Bimestre', 'BIMESTRE', 2, '2025-05-01', '2025-07-31', '#FF9800'),

-- Tercer Bimestre
(4, 1, '2025-BIM3', 'Tercer Bimestre', 'BIMESTRE', 3, '2025-07-25', '2025-10-10', '#9C27B0'),

-- Cuarto Bimestre
(5, 1, '2025-BIM4', 'Cuarto Bimestre', 'BIMESTRE', 4, '2025-10-08', '2025-12-10', '#F44336'),

-- Periodo de Clausura (cierre administrativo)
(6, 1, '2025-CLAU', 'Clausura', 'CLAUSURA', NULL, '2025-12-11', '2025-12-12', '#9E9E9E');

-- ============================================
-- INSERTAR PERIODOS ACADÉMICOS 2026
-- Estructura: Planificación + 4 Bimestres + Clausura
-- IDs: 7-12
-- Inicio: lunes 19 de enero de 2026
-- ============================================

INSERT INTO periodos_academicos (id, gestion_id, codigo, nombre, division, numero_orden, fecha_inicio, fecha_fin, color_hex) VALUES
-- Periodo de Planificación (antes de iniciar clases)
(7, 2, '2026-PLAN', 'Inscripción y Planificación', 'PLANIFICACION', NULL, '2026-01-19', '2026-02-28', '#4CAF50'),

-- Primer Bimestre
(8, 2, '2026-BIM1', 'Primer Bimestre', 'BIMESTRE', 1, '2026-02-24', '2026-05-08', '#2196F3'),

-- Segundo Bimestre
(9, 2, '2026-BIM2', 'Segundo Bimestre', 'BIMESTRE', 2, '2026-05-11', '2026-08-07', '#FF9800'),

-- Tercer Bimestre
(10, 2, '2026-BIM3', 'Tercer Bimestre', 'BIMESTRE', 3, '2026-08-03', '2026-10-16', '#9C27B0'),

-- Cuarto Bimestre
(11, 2, '2026-BIM4', 'Cuarto Bimestre', 'BIMESTRE', 4, '2026-10-14', '2026-12-09', '#F44336'),

-- Periodo de Clausura (cierre administrativo)
(12, 2, '2026-CLAU', 'Clausura', 'CLAUSURA', NULL, '2026-12-10', '2026-12-11', '#9E9E9E');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
