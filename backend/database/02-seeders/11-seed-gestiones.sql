-- ============================================
-- SEEDER: gestiones
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Gestiones académicas
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones;

-- ============================================
-- INSERTAR GESTIONES
-- ============================================

INSERT INTO gestiones (codigo, anio, fecha_inicio_administrativa, fecha_fin_administrativa) VALUES
('2026', 2026, '2026-02-01', '2026-12-31'),
('2025', 2025, '2025-02-01', '2025-12-31');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

