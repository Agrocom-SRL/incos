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
-- Ordenados por proximidad geográfica a Bolivia
-- (Bolivia primero, luego los más cercanos, al final los más lejanos)
-- IDs fijos para facilitar migraciones y referencias consistentes
-- ============================================

INSERT INTO paises (id, nombre, codigo_iso) VALUES
-- 1. Bolivia (país principal)
(1, 'Bolivia', 'BOL'),

-- 2. Países limítrofes directos (más cercanos)
(2, 'Brasil', 'BRA'),      -- Limítrofe
(3, 'Perú', 'PER'),        -- Limítrofe
(4, 'Argentina', 'ARG'),   -- Limítrofe
(5, 'Chile', 'CHL'),       -- Limítrofe
(6, 'Paraguay', 'PRY'),    -- Limítrofe

-- 3. Otros países sudamericanos cercanos
(7, 'Colombia', 'COL'),    -- Cercano (Norte de Sudamérica)
(8, 'Ecuador', 'ECU'),     -- Cercano (Norte de Sudamérica)
(9, 'Uruguay', 'URY'),     -- Cercano (Cono Sur)
(10, 'Venezuela', 'VEN'),   -- Cercano (Norte de Sudamérica)

-- 4. Países del Escudo Guayanés (limítrofes con Brasil)
(11, 'Guyana', 'GUY'),      -- Limítrofe con Brasil
(12, 'Surinam', 'SUR'),     -- Limítrofe con Brasil
(13, 'Guyana Francesa', 'GUF'), -- Limítrofe con Brasil

-- 5. Países de Centroamérica (intermedio)
(14, 'Panamá', 'PAN'),
(15, 'Costa Rica', 'CRI'),
(16, 'Nicaragua', 'NIC'),
(17, 'Honduras', 'HND'),
(18, 'El Salvador', 'SLV'),
(19, 'Guatemala', 'GTM'),
(20, 'Belice', 'BLZ'),
(21, 'México', 'MEX'),

-- 6. Países del Caribe (intermedio-lejano)
(22, 'Cuba', 'CUB'),
(23, 'República Dominicana', 'DOM'),
(24, 'Haití', 'HTI'),
(25, 'Jamaica', 'JAM'),
(26, 'Trinidad y Tobago', 'TTO'),
(27, 'Puerto Rico', 'PRI'),
(28, 'Barbados', 'BRB'),
(29, 'Bahamas', 'BHS'),

-- 7. Países más lejanos de Bolivia
(30, 'Estados Unidos', 'USA'),  -- América del Norte (lejano)
(31, 'España', 'ESP');          -- Europa (más lejano)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

