-- ============================================
-- SEEDER: paises
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Bolivia
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE paises;

-- ============================================
-- INSERTAR PAÍSES
-- ============================================

INSERT INTO paises (nombre, codigo_iso) VALUES
('Bolivia', 'BOL');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

