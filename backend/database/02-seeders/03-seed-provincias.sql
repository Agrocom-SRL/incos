-- ============================================
-- SEEDER: provincias
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Provincias de Bolivia (112 provincias)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE provincias;

-- ============================================
-- INSERTAR PROVINCIAS
-- Ordenadas según el orden de los departamentos (1-9)
-- Dentro de cada departamento, ordenadas por población (de mayor a menor)
-- IDs fijos secuenciales: Santa Cruz (1), La Paz (2), Cochabamba (3), Potosí (4), 
--                         Chuquisaca (5), Oruro (6), Tarija (7), Beni (8), Pando (9)
-- ============================================

-- DEPARTAMENTO: SANTA CRUZ (15 provincias) - IDs 1-15, departamento_id = 1
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(1, 1, 'Andrés Ibáñez', NULL),           -- 1. Más poblada (Santa Cruz ciudad)
(2, 1, 'Ignacio Warnes', NULL),          -- 2.
(3, 1, 'Obispo Santiestevan', NULL),     -- 3.
(4, 1, 'Sara', NULL),                    -- 4.
(5, 1, 'Cordillera', NULL),              -- 5.
(6, 1, 'Ichilo', NULL),                  -- 6.
(7, 1, 'Vallegrande', NULL),             -- 7.
(8, 1, 'Manuel María Caballero', NULL),  -- 8.
(9, 1, 'Ñuflo de Chávez', NULL),         -- 9.
(10, 1, 'Guarayos', NULL),                -- 10.
(11, 1, 'Chiquitos', NULL),               -- 11.
(12, 1, 'José Miguel de Velasco', NULL),  -- 12.
(13, 1, 'Germán Busch', NULL),            -- 13.
(14, 1, 'Florida', NULL),                 -- 14.
(15, 1, 'Ángel Sandoval', NULL);          -- 15. Menos poblada

-- DEPARTAMENTO: LA PAZ (20 provincias) - IDs 16-35, departamento_id = 2
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(16, 2, 'Pedro Domingo Murillo', NULL),  -- 1. Más poblada (La Paz ciudad)
(17, 2, 'Los Andes', NULL),               -- 2. (El Alto)
(18, 2, 'Ingavi', NULL),                  -- 3.
(19, 2, 'Aroma', NULL),                   -- 4.
(20, 2, 'Omasuyos', NULL),                -- 5.
(21, 2, 'Gualberto Villarroel', NULL),    -- 6.
(22, 2, 'Manco Kapac', NULL),             -- 7. (Copacabana)
(23, 2, 'Pacajes', NULL),                 -- 8.
(24, 2, 'Nor Yungas', NULL),              -- 9.
(25, 2, 'Sud Yungas', NULL),              -- 10.
(26, 2, 'Caranavi', NULL),                -- 11.
(27, 2, 'Larecaja', NULL),                -- 12.
(28, 2, 'Inquisivi', NULL),               -- 13.
(29, 2, 'Loayza', NULL),                  -- 14.
(30, 2, 'José Manuel Pando', NULL),       -- 15.
(31, 2, 'Muñecas', NULL),                 -- 16.
(32, 2, 'Eliodoro Camacho', NULL),        -- 17.
(33, 2, 'Bautista Saavedra', NULL),       -- 18.
(34, 2, 'Franz Tamayo', NULL),            -- 19.
(35, 2, 'Abel Iturralde', NULL);          -- 20. Menos poblada

-- DEPARTAMENTO: COCHABAMBA (16 provincias) - IDs 36-51, departamento_id = 3
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(36, 3, 'Cercado', NULL),          -- 1. Más poblada (Cochabamba ciudad)
(37, 3, 'Quillacollo', NULL),      -- 2.
(38, 3, 'Chapare', NULL),          -- 3.
(39, 3, 'Punata', NULL),           -- 4.
(40, 3, 'Tapacarí', NULL),         -- 5.
(41, 3, 'Esteban Arze', NULL),     -- 6.
(42, 3, 'Arani', NULL),            -- 7.
(43, 3, 'Ayopaya', NULL),          -- 8.
(44, 3, 'Capinota', NULL),         -- 9.
(45, 3, 'Carrasco', NULL),         -- 10.
(46, 3, 'Bolívar', NULL),          -- 11.
(47, 3, 'Mizque', NULL),           -- 12.
(48, 3, 'Campero', NULL),          -- 13.
(49, 3, 'Tiraque', NULL),          -- 14.
(50, 3, 'Germán Jordán', NULL),    -- 15.
(51, 3, 'Arque', NULL);            -- 16. Menos poblada

-- DEPARTAMENTO: POTOSÍ (16 provincias) - IDs 52-67, departamento_id = 4
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(52, 4, 'Tomás Frías', NULL),            -- 1. Más poblada (Potosí ciudad)
(53, 4, 'Nor Chichas', NULL),            -- 2.
(54, 4, 'Modesto Omiste', NULL),         -- 3.
(55, 4, 'Enrique Baldivieso', NULL),     -- 4.
(56, 4, 'Rafael Bustillo', NULL),        -- 5.
(57, 4, 'Antonio Quijarro', NULL),       -- 6.
(58, 4, 'Sud Chichas', NULL),            -- 7.
(59, 4, 'Cornelio Saavedra', NULL),      -- 8.
(60, 4, 'José María Linares', NULL),     -- 9.
(61, 4, 'Charcas', NULL),                -- 10.
(62, 4, 'Chayanta', NULL),               -- 11.
(63, 4, 'Nor Lípez', NULL),              -- 12.
(64, 4, 'Sud Lípez', NULL),              -- 13.
(65, 4, 'Alonso de Ibáñez', NULL),       -- 14.
(66, 4, 'Bernardino Bilbao', NULL),      -- 15.
(67, 4, 'Daniel Campos', NULL);          -- 16. Menos poblada

-- DEPARTAMENTO: CHUQUISACA (10 provincias) - IDs 68-77, departamento_id = 5
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(68, 5, 'Oropeza', NULL),                -- 1. Más poblada (Sucre ciudad)
(69, 5, 'Tomina', NULL),                 -- 2.
(70, 5, 'Azurduy', NULL),                -- 3.
(71, 5, 'Jaime Zudáñez', NULL),          -- 4.
(72, 5, 'Yamparáez', NULL),              -- 5.
(73, 5, 'Hernando Siles', NULL),         -- 6.
(74, 5, 'Nor Cinti', NULL),              -- 7.
(75, 5, 'Sud Cinti', NULL),              -- 8.
(76, 5, 'Belisario Boeto', NULL),        -- 9.
(77, 5, 'Luis Calvo', NULL);             -- 10. Menos poblada

-- DEPARTAMENTO: ORURO (16 provincias) - IDs 78-93, departamento_id = 6
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(78, 6, 'Cercado', NULL),                -- 1. Más poblada (Oruro ciudad)
(79, 6, 'Poopó', NULL),                  -- 2.
(80, 6, 'Pantaleón Dalence', NULL),      -- 3.
(81, 6, 'Saucarí', NULL),                -- 4.
(82, 6, 'Sebastián Pagador', NULL),      -- 5.
(83, 6, 'Tomas Barrón', NULL),           -- 6.
(84, 6, 'Mejillones', NULL),             -- 7.
(85, 6, 'San Pedro de Totora', NULL),    -- 8.
(86, 6, 'Litoral', NULL),                -- 9.
(87, 6, 'Eduardo Avaroa', NULL),         -- 10.
(88, 6, 'Nor Carangas', NULL),           -- 11.
(89, 6, 'Sud Carangas', NULL),           -- 12.
(90, 6, 'Carangas', NULL),               -- 13.
(91, 6, 'Sajama', NULL),                 -- 14.
(92, 6, 'Ladislao Cabrera', NULL),       -- 15.
(93, 6, 'Atahuallpa', NULL);             -- 16. Menos poblada

-- DEPARTAMENTO: TARIJA (6 provincias) - IDs 94-99, departamento_id = 7
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(94, 7, 'Cercado', NULL),                -- 1. Más poblada (Tarija ciudad)
(95, 7, 'Eustaquio Méndez', NULL),       -- 2.
(96, 7, 'José María Avilés', NULL),      -- 3.
(97, 7, 'Aniceto Arce', NULL),           -- 4.
(98, 7, 'Burnet O''Connor', NULL),       -- 5.
(99, 7, 'Gran Chaco', NULL);             -- 6. Menos poblada

-- DEPARTAMENTO: BENI (8 provincias) - IDs 100-107, departamento_id = 8
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(100, 8, 'Cercado', NULL),                -- 1. Más poblada (Trinidad ciudad)
(101, 8, 'Yacuma', NULL),                 -- 2.
(102, 8, 'Vaca Díez', NULL),              -- 3.
(103, 8, 'Mamoré', NULL),                 -- 4.
(104, 8, 'Moxos', NULL),                  -- 5.
(105, 8, 'Marbán', NULL),                 -- 6.
(106, 8, 'José Ballivián', NULL),         -- 7.
(107, 8, 'Iténez', NULL);                 -- 8. Menos poblada

-- DEPARTAMENTO: PANDO (5 provincias) - IDs 108-112, departamento_id = 9
INSERT INTO provincias (id, departamento_id, nombre, codigo) VALUES
(108, 9, 'Nicolás Suárez', NULL),         -- 1. Más poblada (Cobija ciudad)
(109, 9, 'Manuripi', NULL),               -- 2.
(110, 9, 'Madre de Dios', NULL),          -- 3.
(111, 9, 'Federico Román', NULL),         -- 4.
(112, 9, 'Abuná', NULL);                  -- 5. Menos poblada

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

