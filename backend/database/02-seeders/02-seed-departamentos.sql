-- ============================================
-- SEEDER: departamentos
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: 9 Departamentos de Bolivia
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE departamentos;

-- ============================================
-- INSERTAR DEPARTAMENTOS DE BOLIVIA
-- Ordenados por población (de mayor a menor)
-- IDs fijos: Bolivia tiene ID 1 en paises
-- ============================================

INSERT INTO departamentos (id, pais_id, nombre, codigo) VALUES
(1, 1, 'Santa Cruz', 'SC'),      -- 1. Más poblado
(2, 1, 'La Paz', 'LP'),          -- 2
(3, 1, 'Cochabamba', 'CB'),      -- 3
(4, 1, 'Potosí', 'PT'),          -- 4
(5, 1, 'Chuquisaca', 'CH'),      -- 5
(6, 1, 'Oruro', 'OR'),           -- 6
(7, 1, 'Tarija', 'TJ'),          -- 7
(8, 1, 'Beni', 'BN'),            -- 8
(9, 1, 'Pando', 'PD');           -- 9. Menos poblado

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

