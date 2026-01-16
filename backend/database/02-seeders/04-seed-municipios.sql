-- ============================================
-- SEEDER: municipios
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Municipios de Bolivia
-- IDs fijos basados en el orden de las provincias (1-112)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE municipios;

-- ============================================
-- INSERTAR MUNICIPIOS
-- Ordenados según el orden de las provincias (1-112)
-- IDs fijos secuenciales por provincia
-- ============================================

-- ============================================
-- SANTA CRUZ - Provincias 1-15
-- ============================================

-- PROVINCIA 1: Andrés Ibáñez (provincia_id = 1)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(1, 1, 'Santa Cruz de la Sierra', NULL),
(2, 1, 'Cotoca', NULL),
(3, 1, 'Porongo', NULL),
(4, 1, 'La Guardia', NULL),
(5, 1, 'El Torno', NULL);

-- PROVINCIA 2: Ignacio Warnes (provincia_id = 2)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(6, 2, 'Warnes', NULL),
(7, 2, 'Okinawa Uno', NULL);

-- PROVINCIA 3: Obispo Santiestevan (provincia_id = 3)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(8, 3, 'Montero', NULL),
(9, 3, 'General Saavedra', NULL),
(10, 3, 'Mineros', NULL),
(11, 3, 'Fernández Alonso', NULL),
(12, 3, 'San Pedro', NULL);

-- PROVINCIA 4: Sara (provincia_id = 4)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(13, 4, 'Portachuelo', NULL),
(14, 4, 'Santa Rosa del Sara', NULL),
(15, 4, 'Colpa Bélgica', NULL);

-- PROVINCIA 5: Cordillera (provincia_id = 5)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(16, 5, 'Lagunillas', NULL),
(17, 5, 'Charagua', NULL),
(18, 5, 'Cabezas', NULL),
(19, 5, 'Cuevo', NULL),
(20, 5, 'Gutiérrez', NULL),
(21, 5, 'Camiri', NULL),
(22, 5, 'Boyuibe', NULL);

-- PROVINCIA 6: Ichilo (provincia_id = 6)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(23, 6, 'Buena Vista', NULL),
(24, 6, 'San Carlos', NULL),
(25, 6, 'Yapacaní', NULL),
(26, 6, 'San Juan de Yapacaní', NULL);

-- PROVINCIA 7: Vallegrande (provincia_id = 7)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(27, 7, 'Vallegrande', NULL),
(28, 7, 'Trigal', NULL),
(29, 7, 'Moro Moro', NULL),
(30, 7, 'Postrer Valle', NULL),
(31, 7, 'Pucará', NULL);

-- PROVINCIA 8: Manuel María Caballero (provincia_id = 8)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(32, 8, 'Comarapa', NULL),
(33, 8, 'Saipina', NULL);

-- PROVINCIA 9: Ñuflo de Chávez (provincia_id = 9)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(34, 9, 'Concepción', NULL),
(35, 9, 'San Javier', NULL),
(36, 9, 'San Ramón', NULL),
(37, 9, 'San Julián', NULL),
(38, 9, 'San Antonio de Lomerío', NULL),
(39, 9, 'Cuatro Cañadas', NULL);

-- PROVINCIA 10: Guarayos (provincia_id = 10)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(40, 10, 'Ascensión de Guarayos', NULL),
(41, 10, 'Urubichá', NULL),
(42, 10, 'El Puente', NULL);

-- PROVINCIA 11: Chiquitos (provincia_id = 11)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(43, 11, 'San José de Chiquitos', NULL),
(44, 11, 'Pailón', NULL),
(45, 11, 'Roboré', NULL);

-- PROVINCIA 12: José Miguel de Velasco (provincia_id = 12)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(46, 12, 'San Ignacio de Velasco', NULL),
(47, 12, 'San Miguel de Velasco', NULL),
(48, 12, 'San Rafael', NULL);

-- PROVINCIA 13: Germán Busch (provincia_id = 13)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(49, 13, 'Puerto Suárez', NULL),
(50, 13, 'Puerto Quijarro', NULL),
(51, 13, 'El Carmen Rivero Tórrez', NULL);

-- PROVINCIA 14: Florida (provincia_id = 14)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(52, 14, 'Samaipata', NULL),
(53, 14, 'Pampa Grande', NULL),
(54, 14, 'Mairana', NULL),
(55, 14, 'Quirusillas', NULL);

-- PROVINCIA 15: Ángel Sandoval (provincia_id = 15)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(56, 15, 'San Matías', NULL);

-- ============================================
-- LA PAZ - Provincias 16-35
-- ============================================

-- PROVINCIA 16: Pedro Domingo Murillo (provincia_id = 16)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(57, 16, 'La Paz', NULL),
(58, 16, 'El Alto', NULL),
(59, 16, 'Palca', NULL),
(60, 16, 'Achocalla', NULL),
(61, 16, 'Mecapaca', NULL);

-- PROVINCIA 17: Los Andes (provincia_id = 17)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(62, 17, 'Pucarani', NULL),
(63, 17, 'Laja', NULL),
(64, 17, 'Batallas', NULL),
(65, 17, 'Puerto Pérez', NULL);

-- PROVINCIA 18: Ingavi (provincia_id = 18)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(66, 18, 'Viacha', NULL),
(67, 18, 'Guaqui', NULL),
(68, 18, 'Tiahuanacu', NULL),
(69, 18, 'Desaguadero', NULL),
(70, 18, 'San Andrés de Machaca', NULL),
(71, 18, 'Jesús de Machaca', NULL),
(72, 18, 'Taraco', NULL);

-- PROVINCIA 19: Aroma (provincia_id = 19)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(73, 19, 'Sica Sica', NULL),
(74, 19, 'Umala', NULL),
(75, 19, 'Ayo Ayo', NULL),
(76, 19, 'Calamarca', NULL),
(77, 19, 'Patacamaya', NULL),
(78, 19, 'Colquencha', NULL),
(79, 19, 'Collana', NULL);

-- PROVINCIA 20: Omasuyos (provincia_id = 20)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(80, 20, 'Achacachi', NULL),
(81, 20, 'Ancoraimes', NULL),
(82, 20, 'Chua Cocani', NULL),
(83, 20, 'Huarina', NULL),
(84, 20, 'Santiago de Huata', NULL),
(85, 20, 'Huatajata', NULL);

-- PROVINCIA 21: Gualberto Villarroel (provincia_id = 21)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(86, 21, 'San Pedro de Curahuara', NULL),
(87, 21, 'Papel Pampa', NULL),
(88, 21, 'Chacarilla', NULL),
(89, 21, 'Turco', NULL),
(90, 21, 'Nazacara', NULL);

-- PROVINCIA 22: Manco Kapac (provincia_id = 22)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(91, 22, 'Copacabana', NULL),
(92, 22, 'San Pedro de Tiquina', NULL),
(93, 22, 'Tito Yupanki', NULL);

-- PROVINCIA 23: Pacajes (provincia_id = 23)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(94, 23, 'Coro Coro', NULL),
(95, 23, 'Caquiaviri', NULL),
(96, 23, 'Calacoto', NULL),
(97, 23, 'Comanche', NULL),
(98, 23, 'Charaña', NULL),
(99, 23, 'Waldo Ballivián', NULL),
(100, 23, 'Nazacara de Pacajes', NULL),
(101, 23, 'Callapa', NULL),
(102, 23, 'Santiago de Callapa', NULL);

-- PROVINCIA 24: Nor Yungas (provincia_id = 24)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(103, 24, 'Coroico', NULL),
(104, 24, 'Coripata', NULL);

-- PROVINCIA 25: Sud Yungas (provincia_id = 25)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(105, 25, 'Chulumani', NULL),
(106, 25, 'Irupana', NULL),
(107, 25, 'Yanacachi', NULL),
(108, 25, 'Palos Blancos', NULL),
(109, 25, 'La Asunta', NULL);

-- PROVINCIA 26: Caranavi (provincia_id = 26)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(110, 26, 'Caranavi', NULL),
(111, 26, 'Alto Beni', NULL);

-- PROVINCIA 27: Larecaja (provincia_id = 27)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(112, 27, 'Sorata', NULL),
(113, 27, 'Guanay', NULL),
(114, 27, 'Tacacoma', NULL),
(115, 27, 'Quiabaya', NULL),
(116, 27, 'Combaya', NULL),
(117, 27, 'Tipuani', NULL),
(118, 27, 'Mapiri', NULL),
(119, 27, 'Teoponte', NULL);

-- PROVINCIA 28: Inquisivi (provincia_id = 28)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(120, 28, 'Inquisivi', NULL),
(121, 28, 'Quime', NULL),
(122, 28, 'Cajuata', NULL),
(123, 28, 'Colquiri', NULL),
(124, 28, 'Ichoca', NULL),
(125, 28, 'Licoma Pampa', NULL),
(126, 28, 'Viloco', NULL);

-- PROVINCIA 29: Loayza (provincia_id = 29)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(127, 29, 'Yaco', NULL),
(128, 29, 'Malla', NULL),
(129, 29, 'Luribay', NULL),
(130, 29, 'Sapahaqui', NULL),
(131, 29, 'Cairoma', NULL),
(132, 29, 'Caxata', NULL),
(133, 29, 'Sicasica', NULL),
(134, 29, 'Salinas', NULL);

-- PROVINCIA 30: José Manuel Pando (provincia_id = 30)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(135, 30, 'Santiago de Machaca', NULL),
(136, 30, 'Catacora', NULL);

-- PROVINCIA 31: Muñecas (provincia_id = 31)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(137, 31, 'Chuma', NULL),
(138, 31, 'Ayata', NULL),
(139, 31, 'Aucapata', NULL);

-- PROVINCIA 32: Eliodoro Camacho (provincia_id = 32)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(140, 32, 'Puerto Acosta', NULL),
(141, 32, 'Mocomoco', NULL),
(142, 32, 'Puerto Carabuco', NULL),
(143, 32, 'Humanata', NULL),
(144, 32, 'Escoma', NULL);

-- PROVINCIA 33: Bautista Saavedra (provincia_id = 33)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(145, 33, 'Charazani', NULL),
(146, 33, 'Curva', NULL);

-- PROVINCIA 34: Franz Tamayo (provincia_id = 34)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(147, 34, 'Apolo', NULL),
(148, 34, 'Pelechuco', NULL);

-- PROVINCIA 35: Abel Iturralde (provincia_id = 35)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(149, 35, 'Ixiamas', NULL),
(150, 35, 'San Buenaventura', NULL);

-- ============================================
-- COCHABAMBA - Provincias 36-51
-- ============================================

-- PROVINCIA 36: Cercado (provincia_id = 36)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(151, 36, 'Cochabamba', NULL);

-- PROVINCIA 37: Quillacollo (provincia_id = 37)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(152, 37, 'Quillacollo', NULL),
(153, 37, 'Colcapirhua', NULL),
(154, 37, 'Tiquipaya', NULL),
(155, 37, 'Vinto', NULL),
(156, 37, 'Sipe Sipe', NULL),
(157, 37, 'Sacaba', NULL);

-- PROVINCIA 38: Chapare (provincia_id = 38)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(158, 38, 'Villa Tunari', NULL),
(159, 38, 'Shinahota', NULL),
(160, 38, 'Entre Ríos', NULL),
(161, 38, 'Puerto Villarroel', NULL);

-- PROVINCIA 39: Punata (provincia_id = 39)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(162, 39, 'Punata', NULL),
(163, 39, 'Villa Rivero', NULL),
(164, 39, 'San Benito', NULL),
(165, 39, 'Tacachi', NULL),
(166, 39, 'Cuchumuela', NULL),
(167, 39, 'Villa Gualberto Villarroel', NULL);

-- PROVINCIA 40: Tapacarí (provincia_id = 40)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(168, 40, 'Tapacari', NULL);

-- PROVINCIA 41: Esteban Arze (provincia_id = 41)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(169, 41, 'Tarata', NULL),
(170, 41, 'Anzaldo', NULL),
(171, 41, 'Arbieto', NULL),
(172, 41, 'Sacabamba', NULL);

-- PROVINCIA 42: Arani (provincia_id = 42)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(173, 42, 'Arani', NULL),
(174, 42, 'Vacas', NULL);

-- PROVINCIA 43: Ayopaya (provincia_id = 43)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(175, 43, 'Ayopaya', NULL),
(176, 43, 'Independencia', NULL),
(177, 43, 'Morochata', NULL),
(178, 43, 'Cocapata', NULL);

-- PROVINCIA 44: Capinota (provincia_id = 44)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(179, 44, 'Capinota', NULL),
(180, 44, 'Santiváñez', NULL),
(181, 44, 'Sicaya', NULL);

-- PROVINCIA 45: Carrasco (provincia_id = 45)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(182, 45, 'Totora', NULL),
(183, 45, 'Pojo', NULL),
(184, 45, 'Pocona', NULL),
(185, 45, 'Chimoré', NULL);

-- PROVINCIA 46: Bolívar (provincia_id = 46)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(186, 46, 'Bolívar', NULL),
(187, 46, 'San Pedro de Buena Vista', NULL);

-- PROVINCIA 47: Mizque (provincia_id = 47)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(188, 47, 'Mizque', NULL),
(189, 47, 'Vila Vila', NULL),
(190, 47, 'Alalay', NULL);

-- PROVINCIA 48: Campero (provincia_id = 48)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(191, 48, 'Aiquile', NULL),
(192, 48, 'Omereque', NULL),
(193, 48, 'Pasorapa', NULL);

-- PROVINCIA 49: Tiraque (provincia_id = 49)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(194, 49, 'Tiraque', NULL);

-- PROVINCIA 50: Germán Jordán (provincia_id = 50)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(195, 50, 'Cliza', NULL),
(196, 50, 'Toco', NULL),
(197, 50, 'Tolata', NULL);

-- PROVINCIA 51: Arque (provincia_id = 51)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(198, 51, 'Arque', NULL),
(199, 51, 'Tacopaya', NULL);

-- ============================================
-- POTOSÍ - Provincias 52-67
-- ============================================

-- PROVINCIA 52: Tomás Frías (provincia_id = 52)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(200, 52, 'Potosí', NULL),
(201, 52, 'Tinguipaya', NULL),
(202, 52, 'Urmiri', NULL),
(203, 52, 'Yocalla', NULL);

-- PROVINCIA 53: Nor Chichas (provincia_id = 53)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(204, 53, 'Cotagaita', NULL),
(205, 53, 'Vitichi', NULL),
(206, 53, 'Sagrario', NULL),
(207, 53, 'Tacachira', NULL);

-- PROVINCIA 54: Modesto Omiste (provincia_id = 54)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(208, 54, 'Villazón', NULL);

-- PROVINCIA 55: Enrique Baldivieso (provincia_id = 55)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(209, 55, 'San Agustín', NULL);

-- PROVINCIA 56: Rafael Bustillo (provincia_id = 56)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(210, 56, 'Uncía', NULL),
(211, 56, 'Chayanta', NULL),
(212, 56, 'Llallagua', NULL),
(213, 56, 'Chuquihuta', NULL);

-- PROVINCIA 57: Antonio Quijarro (provincia_id = 57)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(214, 57, 'Uyuni', NULL),
(215, 57, 'Tomave', NULL),
(216, 57, 'Porco', NULL);

-- PROVINCIA 58: Sud Chichas (provincia_id = 58)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(217, 58, 'Tupiza', NULL),
(218, 58, 'Atocha', NULL),
(219, 58, 'Esmoraca', NULL),
(220, 58, 'Mojinete', NULL),
(221, 58, 'San Pablo de Lípez', NULL);

-- PROVINCIA 59: Cornelio Saavedra (provincia_id = 59)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(222, 59, 'Betanzos', NULL),
(223, 59, 'Chaquí', NULL),
(224, 59, 'Tacobamba', NULL);

-- PROVINCIA 60: José María Linares (provincia_id = 60)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(225, 60, 'Puna', NULL),
(226, 60, 'Caiza D', NULL),
(227, 60, 'Ckochas', NULL);

-- PROVINCIA 61: Charcas (provincia_id = 61)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(228, 61, 'San Pedro de Buena Vista', NULL),
(229, 61, 'Toro Toro', NULL);

-- PROVINCIA 62: Chayanta (provincia_id = 62)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(230, 62, 'Colquechaca', NULL),
(231, 62, 'Pocoata', NULL),
(232, 62, 'Ravelo', NULL),
(233, 62, 'Ocurí', NULL),
(234, 62, 'Surihaya', NULL);

-- PROVINCIA 63: Nor Lípez (provincia_id = 63)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(235, 63, 'Colcha K', NULL),
(236, 63, 'San Pedro de Quemes', NULL),
(237, 63, 'Llica', NULL);

-- PROVINCIA 64: Sud Lípez (provincia_id = 64)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(238, 64, 'San Pablo de Lípez', NULL),
(239, 64, 'San Antonio de Esmoruco', NULL);

-- PROVINCIA 65: Alonso de Ibáñez (provincia_id = 65)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(240, 65, 'Sacaca', NULL),
(241, 65, 'Caripuyo', NULL);

-- PROVINCIA 66: Bernardino Bilbao (provincia_id = 66)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(242, 66, 'Arampampa', NULL),
(243, 66, 'Acasio', NULL);

-- PROVINCIA 67: Daniel Campos (provincia_id = 67)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(244, 67, 'Llica', NULL),
(245, 67, 'Tahua', NULL);

-- ============================================
-- CHUQUISACA - Provincias 68-77
-- ============================================

-- PROVINCIA 68: Oropeza (provincia_id = 68)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(246, 68, 'Sucre', NULL),
(247, 68, 'Yotala', NULL),
(248, 68, 'Poroma', NULL);

-- PROVINCIA 69: Tomina (provincia_id = 69)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(249, 69, 'Padilla', NULL),
(250, 69, 'Tomina', NULL),
(251, 69, 'Sopachuy', NULL),
(252, 69, 'Villa Alcalá', NULL),
(253, 69, 'El Villar', NULL),
(254, 69, 'Monteagudo', NULL);

-- PROVINCIA 70: Azurduy (provincia_id = 70)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(255, 70, 'Azurduy', NULL),
(256, 70, 'Tarvita', NULL);

-- PROVINCIA 71: Jaime Zudáñez (provincia_id = 71)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(257, 71, 'Villa Zudáñez', NULL),
(258, 71, 'Presto', NULL),
(259, 71, 'Mojocoya', NULL),
(260, 71, 'Icla', NULL);

-- PROVINCIA 72: Yamparáez (provincia_id = 72)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(261, 72, 'Tarabuco', NULL),
(262, 72, 'Yamparáez', NULL);

-- PROVINCIA 73: Hernando Siles (provincia_id = 73)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(263, 73, 'Monteagudo', NULL),
(264, 73, 'Huacareta', NULL),
(265, 73, 'Macharetí', NULL),
(266, 73, 'Villa Vaca Guzmán', NULL);

-- PROVINCIA 74: Nor Cinti (provincia_id = 74)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(267, 74, 'Camargo', NULL),
(268, 74, 'San Lucas', NULL),
(269, 74, 'Incahuasi', NULL),
(270, 74, 'Villa Charcas', NULL);

-- PROVINCIA 75: Sud Cinti (provincia_id = 75)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(271, 75, 'Villa Abecia', NULL),
(272, 75, 'Culpina', NULL),
(273, 75, 'Las Carreras', NULL),
(274, 75, 'Camataquí', NULL);

-- PROVINCIA 76: Belisario Boeto (provincia_id = 76)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(275, 76, 'Villa Serrano', NULL),
(276, 76, 'Las Carreras', NULL);

-- PROVINCIA 77: Luis Calvo (provincia_id = 77)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(277, 77, 'Villa Vaca Guzmán', NULL),
(278, 77, 'Huacaya', NULL),
(279, 77, 'Macharetí', NULL),
(280, 77, 'Boyuibe', NULL);

-- ============================================
-- ORURO - Provincias 78-93
-- ============================================

-- PROVINCIA 78: Cercado (provincia_id = 78)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(281, 78, 'Oruro', NULL),
(282, 78, 'Caracollo', NULL),
(283, 78, 'El Choro', NULL),
(284, 78, 'Soracachi', NULL);

-- PROVINCIA 79: Poopó (provincia_id = 79)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(285, 79, 'Poopó', NULL),
(286, 79, 'Pazña', NULL),
(287, 79, 'Antequera', NULL),
(288, 79, 'Puna', NULL);

-- PROVINCIA 80: Pantaleón Dalence (provincia_id = 80)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(289, 80, 'Huanuni', NULL),
(290, 80, 'Machacamarca', NULL);

-- PROVINCIA 81: Saucarí (provincia_id = 81)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(291, 81, 'Toledo', NULL),
(292, 81, 'Santiago de Huari', NULL);

-- PROVINCIA 82: Sebastián Pagador (provincia_id = 82)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(293, 82, 'Santiago de Huari', NULL),
(294, 82, 'Santuario de Quillacas', NULL);

-- PROVINCIA 83: Tomas Barrón (provincia_id = 83)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(295, 83, 'Eucaliptus', NULL),
(296, 83, 'La Rivera', NULL);

-- PROVINCIA 84: Mejillones (provincia_id = 84)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(297, 84, 'La Rivera', NULL),
(298, 84, 'Todos Santos', NULL),
(299, 84, 'Esmeralda', NULL);

-- PROVINCIA 85: San Pedro de Totora (provincia_id = 85)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(300, 85, 'Totora', NULL);

-- PROVINCIA 86: Litoral (provincia_id = 86)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(301, 86, 'Cruz de Machacamarca', NULL),
(302, 86, 'Esmeralda', NULL),
(303, 86, 'Eucaliptus', NULL);

-- PROVINCIA 87: Eduardo Avaroa (provincia_id = 87)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(304, 87, 'Challapata', NULL),
(305, 87, 'Quillacas', NULL),
(306, 87, 'Santuario de Quillacas', NULL);

-- PROVINCIA 88: Nor Carangas (provincia_id = 88)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(307, 88, 'Huachacalla', NULL);

-- PROVINCIA 89: Sud Carangas (provincia_id = 89)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(308, 89, 'Andamarca', NULL),
(309, 89, 'Belén de Andamarca', NULL);

-- PROVINCIA 90: Carangas (provincia_id = 90)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(310, 90, 'Corque', NULL),
(311, 90, 'Choque Cota', NULL);

-- PROVINCIA 91: Sajama (provincia_id = 91)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(312, 91, 'Curahuara de Carangas', NULL),
(313, 91, 'Turco', NULL);

-- PROVINCIA 92: Ladislao Cabrera (provincia_id = 92)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(314, 92, 'Salinas de Garci Mendoza', NULL);

-- PROVINCIA 93: Atahuallpa (provincia_id = 93)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(315, 93, 'Sabaya', NULL),
(316, 93, 'Coipasa', NULL),
(317, 93, 'Chipaya', NULL);

-- ============================================
-- TARIJA - Provincias 94-99
-- ============================================

-- PROVINCIA 94: Cercado (provincia_id = 94)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(318, 94, 'Tarija', NULL),
(319, 94, 'Uriondo', NULL),
(320, 94, 'Yunchará', NULL);

-- PROVINCIA 95: Eustaquio Méndez (provincia_id = 95)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(321, 95, 'San Lorenzo', NULL),
(322, 95, 'El Puente', NULL);

-- PROVINCIA 96: José María Avilés (provincia_id = 96)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(323, 96, 'Yunchará', NULL),
(324, 96, 'Iscayachi', NULL);

-- PROVINCIA 97: Aniceto Arce (provincia_id = 97)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(325, 97, 'Padcaya', NULL),
(326, 97, 'Bermejo', NULL),
(327, 97, 'Entre Ríos', NULL);

-- PROVINCIA 98: Burnet O''Connor (provincia_id = 98)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(328, 98, 'Villa Montes', NULL);

-- PROVINCIA 99: Gran Chaco (provincia_id = 99)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(329, 99, 'Yacuiba', NULL),
(330, 99, 'Caraparí', NULL),
(331, 99, 'Villa Montes', NULL);

-- ============================================
-- BENI - Provincias 100-107
-- ============================================

-- PROVINCIA 100: Cercado (provincia_id = 100)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(332, 100, 'Trinidad', NULL),
(333, 100, 'San Javier', NULL);

-- PROVINCIA 101: Yacuma (provincia_id = 101)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(334, 101, 'Santa Ana del Yacuma', NULL),
(335, 101, 'Exaltación', NULL);

-- PROVINCIA 102: Vaca Díez (provincia_id = 102)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(336, 102, 'Riberalta', NULL),
(337, 102, 'Guayaramerín', NULL);

-- PROVINCIA 103: Mamoré (provincia_id = 103)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(338, 103, 'San Joaquín', NULL),
(339, 103, 'San Ramón', NULL),
(340, 103, 'Puerto Siles', NULL);

-- PROVINCIA 104: Moxos (provincia_id = 104)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(341, 104, 'San Ignacio', NULL),
(342, 104, 'San Javier', NULL);

-- PROVINCIA 105: Marbán (provincia_id = 105)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(343, 105, 'Loreto', NULL),
(344, 105, 'San Andrés', NULL);

-- PROVINCIA 106: José Ballivián (provincia_id = 106)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(345, 106, 'Rurrenabaque', NULL),
(346, 106, 'Reyes', NULL),
(347, 106, 'San Borja', NULL),
(348, 106, 'Santa Rosa', NULL);

-- PROVINCIA 107: Iténez (provincia_id = 107)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(349, 107, 'Magdalena', NULL),
(350, 107, 'Baures', NULL),
(351, 107, 'Huacaraje', NULL);

-- ============================================
-- PANDO - Provincias 108-112
-- ============================================

-- PROVINCIA 108: Nicolás Suárez (provincia_id = 108)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(352, 108, 'Cobija', NULL),
(353, 108, 'Porvenir', NULL),
(354, 108, 'Filadelfia', NULL),
(355, 108, 'Bella Flor', NULL),
(356, 108, 'Bolpebra', NULL);

-- PROVINCIA 109: Manuripi (provincia_id = 109)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(357, 109, 'Puerto Rico', NULL),
(358, 109, 'San Pedro', NULL);

-- PROVINCIA 110: Madre de Dios (provincia_id = 110)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(359, 110, 'Puerto Gonzalo Moreno', NULL),
(360, 110, 'El Sena', NULL);

-- PROVINCIA 111: Federico Román (provincia_id = 111)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(361, 111, 'Nueva Esperanza', NULL),
(362, 111, 'Villa Nueva', NULL),
(363, 111, 'Santos Mercado', NULL);

-- PROVINCIA 112: Abuná (provincia_id = 112)
INSERT INTO municipios (id, provincia_id, nombre, codigo) VALUES
(364, 112, 'Ingavi', NULL),
(365, 112, 'Nueva Esperanza', NULL);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- Este seeder incluye todos los municipios de Bolivia (365 municipios).
-- IDs fijos secuenciales basados en el orden de las provincias (1-112).
-- Datos estándar geográficos del sistema.
-- ============================================
