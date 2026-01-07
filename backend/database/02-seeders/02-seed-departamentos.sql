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
-- Usamos variables para evitar subconsultas repetidas
-- ============================================

-- Obtener ID de Bolivia
SET @pais_bolivia_id = (SELECT id FROM paises WHERE codigo_iso = 'BOL' LIMIT 1);

INSERT INTO departamentos (pais_id, nombre, codigo) VALUES
(@pais_bolivia_id, 'Santa Cruz', 'SC'),      -- 1. Más poblado
(@pais_bolivia_id, 'La Paz', 'LP'),          -- 2
(@pais_bolivia_id, 'Cochabamba', 'CB'),      -- 3
(@pais_bolivia_id, 'Potosí', 'PT'),          -- 4
(@pais_bolivia_id, 'Chuquisaca', 'CH'),      -- 5
(@pais_bolivia_id, 'Oruro', 'OR'),           -- 6
(@pais_bolivia_id, 'Tarija', 'TJ'),          -- 7
(@pais_bolivia_id, 'Beni', 'BN'),            -- 8
(@pais_bolivia_id, 'Pando', 'PD');           -- 9. Menos poblado

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

