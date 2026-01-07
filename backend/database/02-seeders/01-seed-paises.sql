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
-- ============================================

INSERT INTO paises (nombre, codigo_iso) VALUES
-- 1. Bolivia (país principal)
('Bolivia', 'BOL'),

-- 2. Países limítrofes directos (más cercanos)
('Brasil', 'BRA'),      -- Limítrofe
('Perú', 'PER'),        -- Limítrofe
('Argentina', 'ARG'),   -- Limítrofe
('Chile', 'CHL'),       -- Limítrofe
('Paraguay', 'PRY'),    -- Limítrofe

-- 3. Otros países sudamericanos cercanos
('Colombia', 'COL'),    -- Cercano (Norte de Sudamérica)
('Ecuador', 'ECU'),     -- Cercano (Norte de Sudamérica)
('Uruguay', 'URY'),     -- Cercano (Cono Sur)
('Venezuela', 'VEN'),   -- Cercano (Norte de Sudamérica)

-- 4. Países del Escudo Guayanés (limítrofes con Brasil)
('Guyana', 'GUY'),      -- Limítrofe con Brasil
('Surinam', 'SUR'),     -- Limítrofe con Brasil
('Guyana Francesa', 'GUF'), -- Limítrofe con Brasil

-- 5. Países de Centroamérica (intermedio)
('Panamá', 'PAN'),
('Costa Rica', 'CRI'),
('Nicaragua', 'NIC'),
('Honduras', 'HND'),
('El Salvador', 'SLV'),
('Guatemala', 'GTM'),
('Belice', 'BLZ'),
('México', 'MEX'),

-- 6. Países del Caribe (intermedio-lejano)
('Cuba', 'CUB'),
('República Dominicana', 'DOM'),
('Haití', 'HTI'),
('Jamaica', 'JAM'),
('Trinidad y Tobago', 'TTO'),
('Puerto Rico', 'PRI'),
('Barbados', 'BRB'),
('Bahamas', 'BHS'),

-- 7. Países más lejanos de Bolivia
('Estados Unidos', 'USA'),  -- América del Norte (lejano)
('España', 'ESP');          -- Europa (más lejano)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

