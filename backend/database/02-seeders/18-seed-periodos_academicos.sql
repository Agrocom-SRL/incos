-- ============================================
-- SEEDER: periodos_academicos
-- Sistema de Gestión Académica - Instituto INCOS
-- Periodos académicos de la Gestión 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE periodos_academicos;

-- ============================================
-- INSERTAR PERIODOS ACADÉMICOS 2025
-- Estructura: Planificación + 4 Bimestres + Clausura
-- ============================================

-- Obtener ID de la gestión 2025
SET @gestion_2025_id = (SELECT id FROM gestiones WHERE codigo = '2025-REG' LIMIT 1);

INSERT INTO periodos_academicos (gestion_id, codigo, nombre, division, numero_orden, fecha_inicio, fecha_fin, color_hex) VALUES
-- Periodo de Planificación (antes de iniciar clases)
-- Ajustado: actividades desde 2025-01-13 hasta 2025-02-21
(@gestion_2025_id, '2025-PLAN', 'Inscripción y Planificación', 'PLANIFICACION', NULL, '2025-01-13', '2025-02-21', '#4CAF50'),

-- Primer Bimestre
-- Ajustado: actividades desde 2025-02-10 hasta 2025-04-28
(@gestion_2025_id, '2025-BIM1', 'Primer Bimestre', 'BIMESTRE', 1, '2025-02-10', '2025-04-28', '#2196F3'),

-- Segundo Bimestre
-- Ajustado: actividades desde 2025-05-01 hasta 2025-07-31
(@gestion_2025_id, '2025-BIM2', 'Segundo Bimestre', 'BIMESTRE', 2, '2025-05-01', '2025-07-31', '#FF9800'),

-- Tercer Bimestre
(@gestion_2025_id, '2025-BIM3', 'Tercer Bimestre', 'BIMESTRE', 3, '2025-07-25', '2025-10-10', '#9C27B0'),

-- Cuarto Bimestre
(@gestion_2025_id, '2025-BIM4', 'Cuarto Bimestre', 'BIMESTRE', 4, '2025-10-08', '2025-12-10', '#F44336'),

-- Periodo de Clausura (cierre administrativo)
(@gestion_2025_id, '2025-CLAU', 'Clausura', 'CLAUSURA', NULL, '2025-12-11', '2025-12-12', '#9E9E9E');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
