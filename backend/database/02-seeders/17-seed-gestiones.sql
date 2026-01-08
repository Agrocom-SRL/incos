-- ============================================
-- SEEDER: gestiones
-- Sistema de Gestión Académica - Instituto INCOS
-- Gestión Regular 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones;

-- ============================================
-- INSERTAR GESTIÓN 2025
-- Gestión Regular del año académico 2025
-- ============================================

INSERT INTO gestiones (codigo, nombre, anio, tipo, fecha_inicio, fecha_fin, vigente) VALUES
('2025-REG', 'Gestión Regular 2025', 2025, 'REGULAR', '2025-01-13', '2025-12-12', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
