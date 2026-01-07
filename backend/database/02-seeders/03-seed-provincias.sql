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
-- VARIABLES DE DEPARTAMENTOS
-- ============================================

SET @dep_lp_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1);
SET @dep_cb_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1);
SET @dep_sc_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1);
SET @dep_pt_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1);
SET @dep_ch_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1);
SET @dep_or_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1);
SET @dep_tj_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1);
SET @dep_bn_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1);
SET @dep_pd_id = (SELECT id FROM departamentos WHERE codigo = 'PD' LIMIT 1);

-- ============================================
-- INSERTAR PROVINCIAS
-- Ordenadas por población dentro de cada departamento (de mayor a menor)
-- ============================================

-- DEPARTAMENTO: LA PAZ (20 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_lp_id, 'Pedro Domingo Murillo', NULL),  -- 1. Más poblada (La Paz ciudad)
(@dep_lp_id, 'Los Andes', NULL),               -- 2. (El Alto)
(@dep_lp_id, 'Ingavi', NULL),                  -- 3.
(@dep_lp_id, 'Aroma', NULL),                   -- 4.
(@dep_lp_id, 'Omasuyos', NULL),                -- 5.
(@dep_lp_id, 'Gualberto Villarroel', NULL),    -- 6.
(@dep_lp_id, 'Manco Kapac', NULL),             -- 7. (Copacabana)
(@dep_lp_id, 'Pacajes', NULL),                 -- 8.
(@dep_lp_id, 'Nor Yungas', NULL),              -- 9.
(@dep_lp_id, 'Sud Yungas', NULL),              -- 10.
(@dep_lp_id, 'Caranavi', NULL),                -- 11.
(@dep_lp_id, 'Larecaja', NULL),                -- 12.
(@dep_lp_id, 'Inquisivi', NULL),               -- 13.
(@dep_lp_id, 'Loayza', NULL),                  -- 14.
(@dep_lp_id, 'José Manuel Pando', NULL),       -- 15.
(@dep_lp_id, 'Muñecas', NULL),                 -- 16.
(@dep_lp_id, 'Eliodoro Camacho', NULL),        -- 17.
(@dep_lp_id, 'Bautista Saavedra', NULL),       -- 18.
(@dep_lp_id, 'Franz Tamayo', NULL),            -- 19.
(@dep_lp_id, 'Abel Iturralde', NULL);          -- 20. Menos poblada

-- DEPARTAMENTO: COCHABAMBA (16 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_cb_id, 'Cercado', NULL),          -- 1. Más poblada (Cochabamba ciudad)
(@dep_cb_id, 'Quillacollo', NULL),      -- 2.
(@dep_cb_id, 'Chapare', NULL),          -- 3.
(@dep_cb_id, 'Punata', NULL),           -- 4.
(@dep_cb_id, 'Tapacarí', NULL),         -- 5.
(@dep_cb_id, 'Esteban Arze', NULL),     -- 6.
(@dep_cb_id, 'Arani', NULL),            -- 7.
(@dep_cb_id, 'Ayopaya', NULL),          -- 8.
(@dep_cb_id, 'Capinota', NULL),         -- 9.
(@dep_cb_id, 'Carrasco', NULL),         -- 10.
(@dep_cb_id, 'Bolívar', NULL),          -- 11.
(@dep_cb_id, 'Mizque', NULL),           -- 12.
(@dep_cb_id, 'Campero', NULL),          -- 13.
(@dep_cb_id, 'Tiraque', NULL),          -- 14.
(@dep_cb_id, 'Germán Jordán', NULL),    -- 15.
(@dep_cb_id, 'Arque', NULL);            -- 16. Menos poblada

-- DEPARTAMENTO: SANTA CRUZ (15 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_sc_id, 'Andrés Ibáñez', NULL),           -- 1. Más poblada (Santa Cruz ciudad)
(@dep_sc_id, 'Ignacio Warnes', NULL),          -- 2.
(@dep_sc_id, 'Obispo Santiestevan', NULL),     -- 3.
(@dep_sc_id, 'Sara', NULL),                    -- 4.
(@dep_sc_id, 'Cordillera', NULL),              -- 5.
(@dep_sc_id, 'Ichilo', NULL),                  -- 6.
(@dep_sc_id, 'Vallegrande', NULL),             -- 7.
(@dep_sc_id, 'Manuel María Caballero', NULL),  -- 8.
(@dep_sc_id, 'Ñuflo de Chávez', NULL),         -- 9.
(@dep_sc_id, 'Guarayos', NULL),                -- 10.
(@dep_sc_id, 'Chiquitos', NULL),               -- 11.
(@dep_sc_id, 'José Miguel de Velasco', NULL),  -- 12.
(@dep_sc_id, 'Germán Busch', NULL),            -- 13.
(@dep_sc_id, 'Florida', NULL),                 -- 14.
(@dep_sc_id, 'Ángel Sandoval', NULL);          -- 15. Menos poblada

-- DEPARTAMENTO: POTOSÍ (16 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_pt_id, 'Tomás Frías', NULL),            -- 1. Más poblada (Potosí ciudad)
(@dep_pt_id, 'Nor Chichas', NULL),            -- 2.
(@dep_pt_id, 'Modesto Omiste', NULL),         -- 3.
(@dep_pt_id, 'Enrique Baldivieso', NULL),     -- 4.
(@dep_pt_id, 'Rafael Bustillo', NULL),        -- 5.
(@dep_pt_id, 'Antonio Quijarro', NULL),       -- 6.
(@dep_pt_id, 'Sud Chichas', NULL),            -- 7.
(@dep_pt_id, 'Cornelio Saavedra', NULL),      -- 8.
(@dep_pt_id, 'José María Linares', NULL),     -- 9.
(@dep_pt_id, 'Charcas', NULL),                -- 10.
(@dep_pt_id, 'Chayanta', NULL),               -- 11.
(@dep_pt_id, 'Nor Lípez', NULL),              -- 12.
(@dep_pt_id, 'Sud Lípez', NULL),              -- 13.
(@dep_pt_id, 'Alonso de Ibáñez', NULL),       -- 14.
(@dep_pt_id, 'Bernardino Bilbao', NULL),      -- 15.
(@dep_pt_id, 'Daniel Campos', NULL);          -- 16. Menos poblada

-- DEPARTAMENTO: CHUQUISACA (10 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_ch_id, 'Oropeza', NULL),                -- 1. Más poblada (Sucre ciudad)
(@dep_ch_id, 'Tomina', NULL),                 -- 2.
(@dep_ch_id, 'Azurduy', NULL),                -- 3.
(@dep_ch_id, 'Jaime Zudáñez', NULL),          -- 4.
(@dep_ch_id, 'Yamparáez', NULL),              -- 5.
(@dep_ch_id, 'Hernando Siles', NULL),         -- 6.
(@dep_ch_id, 'Nor Cinti', NULL),              -- 7.
(@dep_ch_id, 'Sud Cinti', NULL),              -- 8.
(@dep_ch_id, 'Belisario Boeto', NULL),        -- 9.
(@dep_ch_id, 'Luis Calvo', NULL);             -- 10. Menos poblada

-- DEPARTAMENTO: ORURO (16 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_or_id, 'Cercado', NULL),                -- 1. Más poblada (Oruro ciudad)
(@dep_or_id, 'Poopó', NULL),                  -- 2.
(@dep_or_id, 'Pantaleón Dalence', NULL),      -- 3.
(@dep_or_id, 'Saucarí', NULL),                -- 4.
(@dep_or_id, 'Sebastián Pagador', NULL),      -- 5.
(@dep_or_id, 'Tomas Barrón', NULL),           -- 6.
(@dep_or_id, 'Mejillones', NULL),             -- 7.
(@dep_or_id, 'San Pedro de Totora', NULL),    -- 8.
(@dep_or_id, 'Litoral', NULL),                -- 9.
(@dep_or_id, 'Eduardo Avaroa', NULL),         -- 10.
(@dep_or_id, 'Nor Carangas', NULL),           -- 11.
(@dep_or_id, 'Sud Carangas', NULL),           -- 12.
(@dep_or_id, 'Carangas', NULL),               -- 13.
(@dep_or_id, 'Sajama', NULL),                 -- 14.
(@dep_or_id, 'Ladislao Cabrera', NULL),       -- 15.
(@dep_or_id, 'Atahuallpa', NULL);             -- 16. Menos poblada

-- DEPARTAMENTO: TARIJA (6 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_tj_id, 'Cercado', NULL),                -- 1. Más poblada (Tarija ciudad)
(@dep_tj_id, 'Eustaquio Méndez', NULL),       -- 2.
(@dep_tj_id, 'José María Avilés', NULL),      -- 3.
(@dep_tj_id, 'Aniceto Arce', NULL),           -- 4.
(@dep_tj_id, 'Burnet O''Connor', NULL),       -- 5.
(@dep_tj_id, 'Gran Chaco', NULL);             -- 6. Menos poblada

-- DEPARTAMENTO: BENI (8 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_bn_id, 'Cercado', NULL),                -- 1. Más poblada (Trinidad ciudad)
(@dep_bn_id, 'Yacuma', NULL),                 -- 2.
(@dep_bn_id, 'Vaca Díez', NULL),              -- 3.
(@dep_bn_id, 'Mamoré', NULL),                 -- 4.
(@dep_bn_id, 'Moxos', NULL),                  -- 5.
(@dep_bn_id, 'Marbán', NULL),                 -- 6.
(@dep_bn_id, 'José Ballivián', NULL),         -- 7.
(@dep_bn_id, 'Iténez', NULL);                 -- 8. Menos poblada

-- DEPARTAMENTO: PANDO (5 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_pd_id, 'Nicolás Suárez', NULL),         -- 1. Más poblada (Cobija ciudad)
(@dep_pd_id, 'Manuripi', NULL),               -- 2.
(@dep_pd_id, 'Madre de Dios', NULL),          -- 3.
(@dep_pd_id, 'Federico Román', NULL),         -- 4.
(@dep_pd_id, 'Abuná', NULL);                  -- 5. Menos poblada

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

