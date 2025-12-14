-- ============================================
-- SEEDER: estados_civiles
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Estados civiles
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE estados_civiles;

-- ============================================
-- INSERTAR ESTADOS CIVILES
-- ============================================

INSERT INTO estados_civiles (nombre, abreviatura) VALUES
('Soltero(a)', 'S'),
('Casado(a)', 'C'),
('Divorciado(a)', 'D'),
('Viudo(a)', 'V'),
('Conviviente', 'CV'),
('Separado(a)', 'SE');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

