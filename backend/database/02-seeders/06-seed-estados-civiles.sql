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
-- IDs fijos para facilitar migraciones y referencias consistentes
-- ============================================

INSERT INTO estados_civiles (id, nombre, abreviatura) VALUES
(1, 'Soltero(a)', 'S'),
(2, 'Casado(a)', 'C'),
(3, 'Divorciado(a)', 'D'),
(4, 'Viudo(a)', 'V'),
(5, 'Conviviente', 'CV'),
(6, 'Separado(a)', 'SE');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

