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
-- ============================================

-- DEPARTAMENTO: LA PAZ (20 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_lp_id, 'Aroma', NULL),
(@dep_lp_id, 'Bautista Saavedra', NULL),
(@dep_lp_id, 'Caranavi', NULL),
(@dep_lp_id, 'Eliodoro Camacho', NULL),
(@dep_lp_id, 'Franz Tamayo', NULL),
(@dep_lp_id, 'Gualberto Villarroel', NULL),
(@dep_lp_id, 'Ingavi', NULL),
(@dep_lp_id, 'Inquisivi', NULL),
(@dep_lp_id, 'José Manuel Pando', NULL),
(@dep_lp_id, 'Larecaja', NULL),
(@dep_lp_id, 'Loayza', NULL),
(@dep_lp_id, 'Los Andes', NULL),
(@dep_lp_id, 'Manco Kapac', NULL),
(@dep_lp_id, 'Muñecas', NULL),
(@dep_lp_id, 'Nor Yungas', NULL),
(@dep_lp_id, 'Omasuyos', NULL),
(@dep_lp_id, 'Pacajes', NULL),
(@dep_lp_id, 'Pedro Domingo Murillo', NULL),
(@dep_lp_id, 'Sud Yungas', NULL),
(@dep_lp_id, 'Abel Iturralde', NULL);

-- DEPARTAMENTO: COCHABAMBA (16 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_cb_id, 'Arani', NULL),
(@dep_cb_id, 'Arque', NULL),
(@dep_cb_id, 'Ayopaya', NULL),
(@dep_cb_id, 'Bolívar', NULL),
(@dep_cb_id, 'Campero', NULL),
(@dep_cb_id, 'Capinota', NULL),
(@dep_cb_id, 'Carrasco', NULL),
(@dep_cb_id, 'Cercado', NULL),
(@dep_cb_id, 'Chapare', NULL),
(@dep_cb_id, 'Esteban Arze', NULL),
(@dep_cb_id, 'Germán Jordán', NULL),
(@dep_cb_id, 'Mizque', NULL),
(@dep_cb_id, 'Punata', NULL),
(@dep_cb_id, 'Quillacollo', NULL),
(@dep_cb_id, 'Tapacarí', NULL),
(@dep_cb_id, 'Tiraque', NULL);

-- DEPARTAMENTO: SANTA CRUZ (15 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_sc_id, 'Andrés Ibáñez', NULL),
(@dep_sc_id, 'Ángel Sandoval', NULL),
(@dep_sc_id, 'Chiquitos', NULL),
(@dep_sc_id, 'Cordillera', NULL),
(@dep_sc_id, 'Florida', NULL),
(@dep_sc_id, 'Germán Busch', NULL),
(@dep_sc_id, 'Guarayos', NULL),
(@dep_sc_id, 'Ichilo', NULL),
(@dep_sc_id, 'Ignacio Warnes', NULL),
(@dep_sc_id, 'José Miguel de Velasco', NULL),
(@dep_sc_id, 'Manuel María Caballero', NULL),
(@dep_sc_id, 'Ñuflo de Chávez', NULL),
(@dep_sc_id, 'Obispo Santiestevan', NULL),
(@dep_sc_id, 'Sara', NULL),
(@dep_sc_id, 'Vallegrande', NULL);

-- DEPARTAMENTO: POTOSÍ (16 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_pt_id, 'Alonso de Ibáñez', NULL),
(@dep_pt_id, 'Antonio Quijarro', NULL),
(@dep_pt_id, 'Bernardino Bilbao', NULL),
(@dep_pt_id, 'Charcas', NULL),
(@dep_pt_id, 'Chayanta', NULL),
(@dep_pt_id, 'Cornelio Saavedra', NULL),
(@dep_pt_id, 'Daniel Campos', NULL),
(@dep_pt_id, 'Enrique Baldivieso', NULL),
(@dep_pt_id, 'José María Linares', NULL),
(@dep_pt_id, 'Modesto Omiste', NULL),
(@dep_pt_id, 'Nor Chichas', NULL),
(@dep_pt_id, 'Nor Lípez', NULL),
(@dep_pt_id, 'Rafael Bustillo', NULL),
(@dep_pt_id, 'Sud Chichas', NULL),
(@dep_pt_id, 'Sud Lípez', NULL),
(@dep_pt_id, 'Tomás Frías', NULL);

-- DEPARTAMENTO: CHUQUISACA (10 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_ch_id, 'Azurduy', NULL),
(@dep_ch_id, 'Belisario Boeto', NULL),
(@dep_ch_id, 'Hernando Siles', NULL),
(@dep_ch_id, 'Jaime Zudáñez', NULL),
(@dep_ch_id, 'Luis Calvo', NULL),
(@dep_ch_id, 'Nor Cinti', NULL),
(@dep_ch_id, 'Oropeza', NULL),
(@dep_ch_id, 'Sud Cinti', NULL),
(@dep_ch_id, 'Tomina', NULL),
(@dep_ch_id, 'Yamparáez', NULL);

-- DEPARTAMENTO: ORURO (16 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_or_id, 'Atahuallpa', NULL),
(@dep_or_id, 'Carangas', NULL),
(@dep_or_id, 'Cercado', NULL),
(@dep_or_id, 'Eduardo Avaroa', NULL),
(@dep_or_id, 'Ladislao Cabrera', NULL),
(@dep_or_id, 'Litoral', NULL),
(@dep_or_id, 'Mejillones', NULL),
(@dep_or_id, 'Nor Carangas', NULL),
(@dep_or_id, 'Pantaleón Dalence', NULL),
(@dep_or_id, 'Poopó', NULL),
(@dep_or_id, 'Sajama', NULL),
(@dep_or_id, 'San Pedro de Totora', NULL),
(@dep_or_id, 'Saucarí', NULL),
(@dep_or_id, 'Sebastián Pagador', NULL),
(@dep_or_id, 'Sud Carangas', NULL),
(@dep_or_id, 'Tomas Barrón', NULL);

-- DEPARTAMENTO: TARIJA (6 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_tj_id, 'Aniceto Arce', NULL),
(@dep_tj_id, 'Burnet O''Connor', NULL),
(@dep_tj_id, 'Cercado', NULL),
(@dep_tj_id, 'Eustaquio Méndez', NULL),
(@dep_tj_id, 'Gran Chaco', NULL),
(@dep_tj_id, 'José María Avilés', NULL);

-- DEPARTAMENTO: BENI (8 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_bn_id, 'Cercado', NULL),
(@dep_bn_id, 'Iténez', NULL),
(@dep_bn_id, 'José Ballivián', NULL),
(@dep_bn_id, 'Mamoré', NULL),
(@dep_bn_id, 'Marbán', NULL),
(@dep_bn_id, 'Moxos', NULL),
(@dep_bn_id, 'Vaca Díez', NULL),
(@dep_bn_id, 'Yacuma', NULL);

-- DEPARTAMENTO: PANDO (5 provincias)
INSERT INTO provincias (departamento_id, nombre, codigo) VALUES
(@dep_pd_id, 'Abuná', NULL),
(@dep_pd_id, 'Federico Román', NULL),
(@dep_pd_id, 'Madre de Dios', NULL),
(@dep_pd_id, 'Manuripi', NULL),
(@dep_pd_id, 'Nicolás Suárez', NULL);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

