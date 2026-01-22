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
-- IDs fijos para facilitar migraciones y referencias consistentes
-- ============================================

INSERT INTO idiomas (id, nombre, codigo_iso) VALUES
-- 1. PRIMER BLOQUE: Idiomas oficiales más hablados en Bolivia (por orden de hablantes)
(1, 'Castellano', 'SPA'),           -- 1. Idioma más hablado (lengua franca)
(2, 'Quechua', 'QUE'),           -- 2. Segundo idioma indígena más hablado
(3, 'Aymara', 'AYM'),            -- 3. Tercer idioma indígena más hablado
(4, 'Guaraní', 'GRN'),           -- 4. Cuarto idioma indígena más hablado
-- 2. SEGUNDO BLOQUE: Idiomas internacionales
(5, 'Inglés', 'ENG'),            -- Idioma internacional
(6, 'Portugués', 'POR'),         -- Idioma internacional (común en frontera con Brasil)
(7, 'Francés', 'FRA'),           -- Idioma internacional
(8, 'Alemán', 'DEU'),            -- Idioma internacional
-- 3. TERCER BLOQUE: Otros idiomas indígenas oficiales de Bolivia (selección de los más importantes)
(9, 'Chiquitano', NULL),         -- Departamento de Santa Cruz
(10, 'Mojeño', NULL),             -- Departamento del Beni
(11, 'Movima', NULL),             -- Departamento del Beni
(12, 'Cavineño', NULL),           -- Norte de La Paz
(13, 'Tacana', NULL),             -- Norte de La Paz
(14, 'Tsimane', NULL),            -- Norte de La Paz (también conocido como Chimane)
(15, 'Yuracaré', NULL),           -- Región del Chapare
(16, 'Uru-Chipaya', NULL);        -- Departamento de Oruro (también conocido como Chipaya)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

