-- ============================================
-- SEEDER: gestiones
-- Sistema de Gestión Académica - Instituto INCOS
-- Gestiones Regulares 2025 y 2026
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones;

-- ============================================
-- INSERTAR GESTIONES
-- IDs fijos: 1 (2025), 2 (2026)
-- ============================================

-- Gestión Regular 2025 (Cerrada)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(1, '2025-REG', 'Gestión Regular 2025', 2025, 'REGULAR', '2025-01-13', '2025-12-12', FALSE);

-- Gestión Regular 2026 (Vigente)
INSERT INTO gestiones (id, codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
(2, '2026-REG', 'Gestión Regular 2026', 2026, 'REGULAR', '2026-01-19', '2026-12-11', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
