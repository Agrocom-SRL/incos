-- ============================================
-- SEEDER: idiomas
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Idiomas de Bolivia y principales
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE idiomas;

-- ============================================
-- INSERTAR IDIOMAS
-- ============================================

INSERT INTO idiomas (nombre, codigo_iso) VALUES
-- 1. PRIMER BLOQUE: Idiomas oficiales más hablados en Bolivia (por orden de hablantes)
('Español', 'SPA'),           -- 1. Idioma más hablado (lengua franca)
('Quechua', 'QUE'),           -- 2. Segundo idioma indígena más hablado
('Aymara', 'AYM'),            -- 3. Tercer idioma indígena más hablado
('Guaraní', 'GRN'),           -- 4. Cuarto idioma indígena más hablado
-- 2. SEGUNDO BLOQUE: Idiomas internacionales
('Inglés', 'ENG'),            -- Idioma internacional
('Portugués', 'POR'),         -- Idioma internacional (común en frontera con Brasil)
('Francés', 'FRA'),           -- Idioma internacional
('Alemán', 'DEU'),            -- Idioma internacional
-- 3. TERCER BLOQUE: Otros idiomas indígenas oficiales de Bolivia (selección de los más importantes)
('Chiquitano', NULL),         -- Departamento de Santa Cruz
('Mojeño', NULL),             -- Departamento del Beni
('Movima', NULL),             -- Departamento del Beni
('Cavineño', NULL),           -- Norte de La Paz
('Tacana', NULL),             -- Norte de La Paz
('Tsimane', NULL),            -- Norte de La Paz (también conocido como Chimane)
('Yuracaré', NULL),           -- Región del Chapare
('Uru-Chipaya', NULL);        -- Departamento de Oruro (también conocido como Chipaya)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

