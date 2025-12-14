-- ============================================
-- SEEDER: municipios
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Municipios de Bolivia
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE municipios;

-- ============================================
-- VARIABLES DE PROVINCIAS - LA PAZ
-- ============================================

SET @prov_lp_aroma_id = (SELECT id FROM provincias WHERE nombre = 'Aroma' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_bautista_saavedra_id = (SELECT id FROM provincias WHERE nombre = 'Bautista Saavedra' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_caranavi_id = (SELECT id FROM provincias WHERE nombre = 'Caranavi' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_eliodoro_camacho_id = (SELECT id FROM provincias WHERE nombre = 'Eliodoro Camacho' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_franz_tamayo_id = (SELECT id FROM provincias WHERE nombre = 'Franz Tamayo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_gualberto_villarroel_id = (SELECT id FROM provincias WHERE nombre = 'Gualberto Villarroel' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_ingavi_id = (SELECT id FROM provincias WHERE nombre = 'Ingavi' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_inquisivi_id = (SELECT id FROM provincias WHERE nombre = 'Inquisivi' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_jose_manuel_pando_id = (SELECT id FROM provincias WHERE nombre = 'José Manuel Pando' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_larecaja_id = (SELECT id FROM provincias WHERE nombre = 'Larecaja' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_loayza_id = (SELECT id FROM provincias WHERE nombre = 'Loayza' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_los_andes_id = (SELECT id FROM provincias WHERE nombre = 'Los Andes' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_manco_kapac_id = (SELECT id FROM provincias WHERE nombre = 'Manco Kapac' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_munecas_id = (SELECT id FROM provincias WHERE nombre = 'Muñecas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_nor_yungas_id = (SELECT id FROM provincias WHERE nombre = 'Nor Yungas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_omasuyos_id = (SELECT id FROM provincias WHERE nombre = 'Omasuyos' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_pacajes_id = (SELECT id FROM provincias WHERE nombre = 'Pacajes' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_pedro_domingo_murillo_id = (SELECT id FROM provincias WHERE nombre = 'Pedro Domingo Murillo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_sud_yungas_id = (SELECT id FROM provincias WHERE nombre = 'Sud Yungas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
SET @prov_lp_abel_iturralde_id = (SELECT id FROM provincias WHERE nombre = 'Abel Iturralde' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);

-- ============================================
-- VARIABLES DE PROVINCIAS - COCHABAMBA
-- ============================================

SET @prov_cb_arani_id = (SELECT id FROM provincias WHERE nombre = 'Arani' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_arque_id = (SELECT id FROM provincias WHERE nombre = 'Arque' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_ayopaya_id = (SELECT id FROM provincias WHERE nombre = 'Ayopaya' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_bolivar_id = (SELECT id FROM provincias WHERE nombre = 'Bolívar' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_campero_id = (SELECT id FROM provincias WHERE nombre = 'Campero' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_capinota_id = (SELECT id FROM provincias WHERE nombre = 'Capinota' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_carrasco_id = (SELECT id FROM provincias WHERE nombre = 'Carrasco' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_cercado_id = (SELECT id FROM provincias WHERE nombre = 'Cercado' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_chapare_id = (SELECT id FROM provincias WHERE nombre = 'Chapare' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_esteban_arce_id = (SELECT id FROM provincias WHERE nombre = 'Esteban Arze' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_german_jordan_id = (SELECT id FROM provincias WHERE nombre = 'Germán Jordán' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_mizque_id = (SELECT id FROM provincias WHERE nombre = 'Mizque' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_punata_id = (SELECT id FROM provincias WHERE nombre = 'Punata' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_quillacollo_id = (SELECT id FROM provincias WHERE nombre = 'Quillacollo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_tapacari_id = (SELECT id FROM provincias WHERE nombre = 'Tapacarí' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);
SET @prov_cb_tiraque_id = (SELECT id FROM provincias WHERE nombre = 'Tiraque' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CB' LIMIT 1) LIMIT 1);

-- ============================================
-- INSERTAR MUNICIPIOS - LA PAZ
-- ============================================

-- PROVINCIA: Pedro Domingo Murillo (La Paz - El Alto - Palca - Achocalla - Mecapaca)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_pedro_domingo_murillo_id, 'La Paz', NULL),
(@prov_lp_pedro_domingo_murillo_id, 'El Alto', NULL),
(@prov_lp_pedro_domingo_murillo_id, 'Palca', NULL),
(@prov_lp_pedro_domingo_murillo_id, 'Achocalla', NULL),
(@prov_lp_pedro_domingo_murillo_id, 'Mecapaca', NULL);

-- PROVINCIA: Ingavi (Viacha, Guaqui, Tiahuanacu, Desaguadero, San Andrés de Machaca, Jesús de Machaca, Taraco)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_ingavi_id, 'Viacha', NULL),
(@prov_lp_ingavi_id, 'Guaqui', NULL),
(@prov_lp_ingavi_id, 'Tiahuanacu', NULL),
(@prov_lp_ingavi_id, 'Desaguadero', NULL),
(@prov_lp_ingavi_id, 'San Andrés de Machaca', NULL),
(@prov_lp_ingavi_id, 'Jesús de Machaca', NULL),
(@prov_lp_ingavi_id, 'Taraco', NULL);

-- PROVINCIA: Los Andes (Pucarani, Laja, Batallas, Puerto Pérez)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_los_andes_id, 'Pucarani', NULL),
(@prov_lp_los_andes_id, 'Laja', NULL),
(@prov_lp_los_andes_id, 'Batallas', NULL),
(@prov_lp_los_andes_id, 'Puerto Pérez', NULL);

-- PROVINCIA: Omasuyos (Achacachi, Ancoraimes, Chua Cocani, Huarina, Santiago de Huata, Huatajata)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_omasuyos_id, 'Achacachi', NULL),
(@prov_lp_omasuyos_id, 'Ancoraimes', NULL),
(@prov_lp_omasuyos_id, 'Chua Cocani', NULL),
(@prov_lp_omasuyos_id, 'Huarina', NULL),
(@prov_lp_omasuyos_id, 'Santiago de Huata', NULL),
(@prov_lp_omasuyos_id, 'Huatajata', NULL);

-- PROVINCIA: Manco Kapac (Copacabana, San Pedro de Tiquina, Tito Yupanki)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_manco_kapac_id, 'Copacabana', NULL),
(@prov_lp_manco_kapac_id, 'San Pedro de Tiquina', NULL),
(@prov_lp_manco_kapac_id, 'Tito Yupanki', NULL);

-- PROVINCIA: Nor Yungas (Coroico, Coripata)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_nor_yungas_id, 'Coroico', NULL),
(@prov_lp_nor_yungas_id, 'Coripata', NULL);

-- PROVINCIA: Sud Yungas (Chulumani, Irupana, Yanacachi, Palos Blancos, La Asunta)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_sud_yungas_id, 'Chulumani', NULL),
(@prov_lp_sud_yungas_id, 'Irupana', NULL),
(@prov_lp_sud_yungas_id, 'Yanacachi', NULL),
(@prov_lp_sud_yungas_id, 'Palos Blancos', NULL),
(@prov_lp_sud_yungas_id, 'La Asunta', NULL);

-- PROVINCIA: Caranavi (Caranavi, Alto Beni)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_caranavi_id, 'Caranavi', NULL),
(@prov_lp_caranavi_id, 'Alto Beni', NULL);

-- PROVINCIA: Aroma (Sica Sica, Umala, Ayo Ayo, Calamarca, Patacamaya, Colquencha, Collana)
SET @prov_lp_aroma_id = (SELECT id FROM provincias WHERE nombre = 'Aroma' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_aroma_id, 'Sica Sica', NULL),
(@prov_lp_aroma_id, 'Umala', NULL),
(@prov_lp_aroma_id, 'Ayo Ayo', NULL),
(@prov_lp_aroma_id, 'Calamarca', NULL),
(@prov_lp_aroma_id, 'Patacamaya', NULL),
(@prov_lp_aroma_id, 'Colquencha', NULL),
(@prov_lp_aroma_id, 'Collana', NULL);

-- PROVINCIA: Bautista Saavedra (Charazani, Curva)
SET @prov_lp_bautista_saavedra_id = (SELECT id FROM provincias WHERE nombre = 'Bautista Saavedra' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_bautista_saavedra_id, 'Charazani', NULL),
(@prov_lp_bautista_saavedra_id, 'Curva', NULL);

-- PROVINCIA: Eliodoro Camacho (Puerto Acosta, Mocomoco, Puerto Carabuco, Humanata, Escoma)
SET @prov_lp_eliodoro_camacho_id = (SELECT id FROM provincias WHERE nombre = 'Eliodoro Camacho' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_eliodoro_camacho_id, 'Puerto Acosta', NULL),
(@prov_lp_eliodoro_camacho_id, 'Mocomoco', NULL),
(@prov_lp_eliodoro_camacho_id, 'Puerto Carabuco', NULL),
(@prov_lp_eliodoro_camacho_id, 'Humanata', NULL),
(@prov_lp_eliodoro_camacho_id, 'Escoma', NULL);

-- PROVINCIA: Franz Tamayo (Apolo, Pelechuco)
SET @prov_lp_franz_tamayo_id = (SELECT id FROM provincias WHERE nombre = 'Franz Tamayo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_franz_tamayo_id, 'Apolo', NULL),
(@prov_lp_franz_tamayo_id, 'Pelechuco', NULL);

-- PROVINCIA: Gualberto Villarroel (San Pedro de Curahuara, Papel Pampa, Chacarilla, Turco, Nazacara)
SET @prov_lp_gualberto_villarroel_id = (SELECT id FROM provincias WHERE nombre = 'Gualberto Villarroel' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_gualberto_villarroel_id, 'San Pedro de Curahuara', NULL),
(@prov_lp_gualberto_villarroel_id, 'Papel Pampa', NULL),
(@prov_lp_gualberto_villarroel_id, 'Chacarilla', NULL),
(@prov_lp_gualberto_villarroel_id, 'Turco', NULL),
(@prov_lp_gualberto_villarroel_id, 'Nazacara', NULL);

-- PROVINCIA: Inquisivi (Inquisivi, Quime, Cajuata, Colquiri, Ichoca, Licoma Pampa, Viloco)
SET @prov_lp_inquisivi_id = (SELECT id FROM provincias WHERE nombre = 'Inquisivi' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_inquisivi_id, 'Inquisivi', NULL),
(@prov_lp_inquisivi_id, 'Quime', NULL),
(@prov_lp_inquisivi_id, 'Cajuata', NULL),
(@prov_lp_inquisivi_id, 'Colquiri', NULL),
(@prov_lp_inquisivi_id, 'Ichoca', NULL),
(@prov_lp_inquisivi_id, 'Licoma Pampa', NULL),
(@prov_lp_inquisivi_id, 'Viloco', NULL);

-- PROVINCIA: José Manuel Pando (Santiago de Machaca, Catacora)
SET @prov_lp_jose_manuel_pando_id = (SELECT id FROM provincias WHERE nombre = 'José Manuel Pando' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_jose_manuel_pando_id, 'Santiago de Machaca', NULL),
(@prov_lp_jose_manuel_pando_id, 'Catacora', NULL);

-- PROVINCIA: Larecaja (Sorata, Guanay, Tacacoma, Quiabaya, Combaya, Tipuani, Mapiri, Teoponte)
SET @prov_lp_larecaja_id = (SELECT id FROM provincias WHERE nombre = 'Larecaja' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_larecaja_id, 'Sorata', NULL),
(@prov_lp_larecaja_id, 'Guanay', NULL),
(@prov_lp_larecaja_id, 'Tacacoma', NULL),
(@prov_lp_larecaja_id, 'Quiabaya', NULL),
(@prov_lp_larecaja_id, 'Combaya', NULL),
(@prov_lp_larecaja_id, 'Tipuani', NULL),
(@prov_lp_larecaja_id, 'Mapiri', NULL),
(@prov_lp_larecaja_id, 'Teoponte', NULL);

-- PROVINCIA: Loayza (Yaco, Malla, Luribay, Sapahaqui, Cairoma, Caxata, Sicasica, Salinas)
SET @prov_lp_loayza_id = (SELECT id FROM provincias WHERE nombre = 'Loayza' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_loayza_id, 'Yaco', NULL),
(@prov_lp_loayza_id, 'Malla', NULL),
(@prov_lp_loayza_id, 'Luribay', NULL),
(@prov_lp_loayza_id, 'Sapahaqui', NULL),
(@prov_lp_loayza_id, 'Cairoma', NULL),
(@prov_lp_loayza_id, 'Caxata', NULL),
(@prov_lp_loayza_id, 'Sicasica', NULL),
(@prov_lp_loayza_id, 'Salinas', NULL);

-- PROVINCIA: Muñecas (Chuma, Ayata, Aucapata)
SET @prov_lp_munecas_id = (SELECT id FROM provincias WHERE nombre = 'Muñecas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_munecas_id, 'Chuma', NULL),
(@prov_lp_munecas_id, 'Ayata', NULL),
(@prov_lp_munecas_id, 'Aucapata', NULL);

-- PROVINCIA: Pacajes (Coro Coro, Caquiaviri, Calacoto, Comanche, Charaña, Waldo Ballivián, Nazacara de Pacajes, Callapa, Santiago de Callapa)
SET @prov_lp_pacajes_id = (SELECT id FROM provincias WHERE nombre = 'Pacajes' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_pacajes_id, 'Coro Coro', NULL),
(@prov_lp_pacajes_id, 'Caquiaviri', NULL),
(@prov_lp_pacajes_id, 'Calacoto', NULL),
(@prov_lp_pacajes_id, 'Comanche', NULL),
(@prov_lp_pacajes_id, 'Charaña', NULL),
(@prov_lp_pacajes_id, 'Waldo Ballivián', NULL),
(@prov_lp_pacajes_id, 'Nazacara de Pacajes', NULL),
(@prov_lp_pacajes_id, 'Callapa', NULL),
(@prov_lp_pacajes_id, 'Santiago de Callapa', NULL);

-- PROVINCIA: Abel Iturralde (Ixiamas, San Buenaventura)
SET @prov_lp_abel_iturralde_id = (SELECT id FROM provincias WHERE nombre = 'Abel Iturralde' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'LP' LIMIT 1) LIMIT 1);
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_lp_abel_iturralde_id, 'Ixiamas', NULL),
(@prov_lp_abel_iturralde_id, 'San Buenaventura', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - COCHABAMBA
-- ============================================

-- PROVINCIA: Cercado (Cochabamba)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_cercado_id, 'Cochabamba', NULL);

-- PROVINCIA: Quillacollo (Quillacollo, Colcapirhua, Tiquipaya, Vinto, Sipe Sipe, Sacaba)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_quillacollo_id, 'Quillacollo', NULL),
(@prov_cb_quillacollo_id, 'Colcapirhua', NULL),
(@prov_cb_quillacollo_id, 'Tiquipaya', NULL),
(@prov_cb_quillacollo_id, 'Vinto', NULL),
(@prov_cb_quillacollo_id, 'Sipe Sipe', NULL),
(@prov_cb_quillacollo_id, 'Sacaba', NULL);

-- PROVINCIA: Chapare (Villa Tunari, Shinahota, Entre Ríos, Puerto Villarroel)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_chapare_id, 'Villa Tunari', NULL),
(@prov_cb_chapare_id, 'Shinahota', NULL),
(@prov_cb_chapare_id, 'Entre Ríos', NULL),
(@prov_cb_chapare_id, 'Puerto Villarroel', NULL);

-- PROVINCIA: Punata (Punata, Villa Rivero, San Benito, Tacachi, Cuchumuela, Villa Gualberto Villarroel)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_punata_id, 'Punata', NULL),
(@prov_cb_punata_id, 'Villa Rivero', NULL),
(@prov_cb_punata_id, 'San Benito', NULL),
(@prov_cb_punata_id, 'Tacachi', NULL),
(@prov_cb_punata_id, 'Cuchumuela', NULL),
(@prov_cb_punata_id, 'Villa Gualberto Villarroel', NULL);

-- PROVINCIA: Arani (Arani, Vacas)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_arani_id, 'Arani', NULL),
(@prov_cb_arani_id, 'Vacas', NULL);

-- PROVINCIA: Esteban Arze (Tarata, Anzaldo, Arbieto, Sacabamba)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_esteban_arce_id, 'Tarata', NULL),
(@prov_cb_esteban_arce_id, 'Anzaldo', NULL),
(@prov_cb_esteban_arce_id, 'Arbieto', NULL),
(@prov_cb_esteban_arce_id, 'Sacabamba', NULL);

-- PROVINCIA: Tapacari (Tapacari)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_tapacari_id, 'Tapacari', NULL);

-- PROVINCIA: Ayopaya (Ayopaya, Independencia, Morochata, Cocapata)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_ayopaya_id, 'Ayopaya', NULL),
(@prov_cb_ayopaya_id, 'Independencia', NULL),
(@prov_cb_ayopaya_id, 'Morochata', NULL),
(@prov_cb_ayopaya_id, 'Cocapata', NULL);

-- PROVINCIA: Capinota (Capinota, Santiváñez, Sicaya)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_capinota_id, 'Capinota', NULL),
(@prov_cb_capinota_id, 'Santiváñez', NULL),
(@prov_cb_capinota_id, 'Sicaya', NULL);

-- PROVINCIA: Mizque (Mizque, Vila Vila, Alalay)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_mizque_id, 'Mizque', NULL),
(@prov_cb_mizque_id, 'Vila Vila', NULL),
(@prov_cb_mizque_id, 'Alalay', NULL);

-- PROVINCIA: Campero (Aiquile, Omereque, Pasorapa)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_campero_id, 'Aiquile', NULL),
(@prov_cb_campero_id, 'Omereque', NULL),
(@prov_cb_campero_id, 'Pasorapa', NULL);

-- PROVINCIA: Carrasco (Totora, Pojo, Pocona, Chimoré)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_carrasco_id, 'Totora', NULL),
(@prov_cb_carrasco_id, 'Pojo', NULL),
(@prov_cb_carrasco_id, 'Pocona', NULL),
(@prov_cb_carrasco_id, 'Chimoré', NULL);

-- PROVINCIA: Germán Jordán (Cliza, Toco, Tolata)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_german_jordan_id, 'Cliza', NULL),
(@prov_cb_german_jordan_id, 'Toco', NULL),
(@prov_cb_german_jordan_id, 'Tolata', NULL);

-- PROVINCIA: Bolívar (Bolívar, San Pedro de Buena Vista)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_bolivar_id, 'Bolívar', NULL),
(@prov_cb_bolivar_id, 'San Pedro de Buena Vista', NULL);

-- PROVINCIA: Tiraque (Tiraque)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_tiraque_id, 'Tiraque', NULL);

-- PROVINCIA: Arque (Arque, Tacopaya)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_cb_arque_id, 'Arque', NULL),
(@prov_cb_arque_id, 'Tacopaya', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - SANTA CRUZ
-- ============================================

-- Variables de provincias de Santa Cruz
SET @prov_sc_andres_ibanez_id = (SELECT id FROM provincias WHERE nombre = 'Andrés Ibáñez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_angel_sandoval_id = (SELECT id FROM provincias WHERE nombre = 'Ángel Sandoval' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_chiquitos_id = (SELECT id FROM provincias WHERE nombre = 'Chiquitos' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_cordillera_id = (SELECT id FROM provincias WHERE nombre = 'Cordillera' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_florida_id = (SELECT id FROM provincias WHERE nombre = 'Florida' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_german_busch_id = (SELECT id FROM provincias WHERE nombre = 'Germán Busch' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_guarayos_id = (SELECT id FROM provincias WHERE nombre = 'Guarayos' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_ichilo_id = (SELECT id FROM provincias WHERE nombre = 'Ichilo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_warnes_id = (SELECT id FROM provincias WHERE nombre = 'Ignacio Warnes' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_velasco_id = (SELECT id FROM provincias WHERE nombre = 'José Miguel de Velasco' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_caballero_id = (SELECT id FROM provincias WHERE nombre = 'Manuel María Caballero' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_nuflo_chavez_id = (SELECT id FROM provincias WHERE nombre = 'Ñuflo de Chávez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_obispo_santiestevan_id = (SELECT id FROM provincias WHERE nombre = 'Obispo Santiestevan' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_sara_id = (SELECT id FROM provincias WHERE nombre = 'Sara' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);
SET @prov_sc_vallegrande_id = (SELECT id FROM provincias WHERE nombre = 'Vallegrande' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'SC' LIMIT 1) LIMIT 1);

-- PROVINCIA: Andrés Ibáñez (Santa Cruz de la Sierra, Cotoca, Porongo, La Guardia, El Torno)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_andres_ibanez_id, 'Santa Cruz de la Sierra', NULL),
(@prov_sc_andres_ibanez_id, 'Cotoca', NULL),
(@prov_sc_andres_ibanez_id, 'Porongo', NULL),
(@prov_sc_andres_ibanez_id, 'La Guardia', NULL),
(@prov_sc_andres_ibanez_id, 'El Torno', NULL);

-- PROVINCIA: Ángel Sandoval (San Matías)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_angel_sandoval_id, 'San Matías', NULL);

-- PROVINCIA: Manuel María Caballero (Comarapa, Saipina)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_caballero_id, 'Comarapa', NULL),
(@prov_sc_caballero_id, 'Saipina', NULL);

-- PROVINCIA: Chiquitos (San José de Chiquitos, Pailón, Roboré)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_chiquitos_id, 'San José de Chiquitos', NULL),
(@prov_sc_chiquitos_id, 'Pailón', NULL),
(@prov_sc_chiquitos_id, 'Roboré', NULL);

-- PROVINCIA: Cordillera (Lagunillas, Charagua, Cabezas, Cuevo, Gutiérrez, Camiri, Boyuibe)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_cordillera_id, 'Lagunillas', NULL),
(@prov_sc_cordillera_id, 'Charagua', NULL),
(@prov_sc_cordillera_id, 'Cabezas', NULL),
(@prov_sc_cordillera_id, 'Cuevo', NULL),
(@prov_sc_cordillera_id, 'Gutiérrez', NULL),
(@prov_sc_cordillera_id, 'Camiri', NULL),
(@prov_sc_cordillera_id, 'Boyuibe', NULL);

-- PROVINCIA: Florida (Samaipata, Pampa Grande, Mairana, Quirusillas)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_florida_id, 'Samaipata', NULL),
(@prov_sc_florida_id, 'Pampa Grande', NULL),
(@prov_sc_florida_id, 'Mairana', NULL),
(@prov_sc_florida_id, 'Quirusillas', NULL);

-- PROVINCIA: Germán Busch (Puerto Suárez, Puerto Quijarro, El Carmen Rivero Tórrez)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_german_busch_id, 'Puerto Suárez', NULL),
(@prov_sc_german_busch_id, 'Puerto Quijarro', NULL),
(@prov_sc_german_busch_id, 'El Carmen Rivero Tórrez', NULL);

-- PROVINCIA: Guarayos (Ascensión de Guarayos, Urubichá, El Puente)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_guarayos_id, 'Ascensión de Guarayos', NULL),
(@prov_sc_guarayos_id, 'Urubichá', NULL),
(@prov_sc_guarayos_id, 'El Puente', NULL);

-- PROVINCIA: Ichilo (Buena Vista, San Carlos, Yapacaní, San Juan de Yapacaní)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_ichilo_id, 'Buena Vista', NULL),
(@prov_sc_ichilo_id, 'San Carlos', NULL),
(@prov_sc_ichilo_id, 'Yapacaní', NULL),
(@prov_sc_ichilo_id, 'San Juan de Yapacaní', NULL);

-- PROVINCIA: Ignacio Warnes (Warnes, Okinawa Uno)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_warnes_id, 'Warnes', NULL),
(@prov_sc_warnes_id, 'Okinawa Uno', NULL);

-- PROVINCIA: José Miguel de Velasco (San Ignacio de Velasco, San Miguel de Velasco, San Rafael)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_velasco_id, 'San Ignacio de Velasco', NULL),
(@prov_sc_velasco_id, 'San Miguel de Velasco', NULL),
(@prov_sc_velasco_id, 'San Rafael', NULL);

-- PROVINCIA: Ñuflo de Chávez (Concepción, San Javier, San Ramón, San Julián, San Antonio de Lomerío, Cuatro Cañadas)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_nuflo_chavez_id, 'Concepción', NULL),
(@prov_sc_nuflo_chavez_id, 'San Javier', NULL),
(@prov_sc_nuflo_chavez_id, 'San Ramón', NULL),
(@prov_sc_nuflo_chavez_id, 'San Julián', NULL),
(@prov_sc_nuflo_chavez_id, 'San Antonio de Lomerío', NULL),
(@prov_sc_nuflo_chavez_id, 'Cuatro Cañadas', NULL);

-- PROVINCIA: Obispo Santiestevan (Montero, General Saavedra, Mineros, Fernández Alonso, San Pedro)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_obispo_santiestevan_id, 'Montero', NULL),
(@prov_sc_obispo_santiestevan_id, 'General Saavedra', NULL),
(@prov_sc_obispo_santiestevan_id, 'Mineros', NULL),
(@prov_sc_obispo_santiestevan_id, 'Fernández Alonso', NULL),
(@prov_sc_obispo_santiestevan_id, 'San Pedro', NULL);

-- PROVINCIA: Sara (Portachuelo, Santa Rosa del Sara, Colpa Bélgica)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_sara_id, 'Portachuelo', NULL),
(@prov_sc_sara_id, 'Santa Rosa del Sara', NULL),
(@prov_sc_sara_id, 'Colpa Bélgica', NULL);

-- PROVINCIA: Vallegrande (Vallegrande, Trigal, Moro Moro, Postrer Valle, Pucará)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_sc_vallegrande_id, 'Vallegrande', NULL),
(@prov_sc_vallegrande_id, 'Trigal', NULL),
(@prov_sc_vallegrande_id, 'Moro Moro', NULL),
(@prov_sc_vallegrande_id, 'Postrer Valle', NULL),
(@prov_sc_vallegrande_id, 'Pucará', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - POTOSÍ
-- ============================================

-- Variables de provincias de Potosí
SET @prov_pt_alonso_ibanez_id = (SELECT id FROM provincias WHERE nombre = 'Alonso de Ibáñez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_antonio_quijarro_id = (SELECT id FROM provincias WHERE nombre = 'Antonio Quijarro' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_bernardino_bilbao_id = (SELECT id FROM provincias WHERE nombre = 'Bernardino Bilbao' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_charcas_id = (SELECT id FROM provincias WHERE nombre = 'Charcas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_chayanta_id = (SELECT id FROM provincias WHERE nombre = 'Chayanta' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_cornelio_saavedra_id = (SELECT id FROM provincias WHERE nombre = 'Cornelio Saavedra' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_daniel_campos_id = (SELECT id FROM provincias WHERE nombre = 'Daniel Campos' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_enrique_baldivieso_id = (SELECT id FROM provincias WHERE nombre = 'Enrique Baldivieso' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_jose_maria_linares_id = (SELECT id FROM provincias WHERE nombre = 'José María Linares' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_modesto_omiste_id = (SELECT id FROM provincias WHERE nombre = 'Modesto Omiste' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_nor_chichas_id = (SELECT id FROM provincias WHERE nombre = 'Nor Chichas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_nor_lipez_id = (SELECT id FROM provincias WHERE nombre = 'Nor Lípez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_rafael_bustillo_id = (SELECT id FROM provincias WHERE nombre = 'Rafael Bustillo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_sud_chichas_id = (SELECT id FROM provincias WHERE nombre = 'Sud Chichas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_sud_lipez_id = (SELECT id FROM provincias WHERE nombre = 'Sud Lípez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);
SET @prov_pt_tomas_frias_id = (SELECT id FROM provincias WHERE nombre = 'Tomás Frías' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PT' LIMIT 1) LIMIT 1);

-- PROVINCIA: Tomás Frías (Potosí, Tinguipaya, Urmiri, Yocalla)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_tomas_frias_id, 'Potosí', NULL),
(@prov_pt_tomas_frias_id, 'Tinguipaya', NULL),
(@prov_pt_tomas_frias_id, 'Urmiri', NULL),
(@prov_pt_tomas_frias_id, 'Yocalla', NULL);

-- PROVINCIA: Rafael Bustillo (Uncía, Chayanta, Llallagua, Chuquihuta)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_rafael_bustillo_id, 'Uncía', NULL),
(@prov_pt_rafael_bustillo_id, 'Chayanta', NULL),
(@prov_pt_rafael_bustillo_id, 'Llallagua', NULL),
(@prov_pt_rafael_bustillo_id, 'Chuquihuta', NULL);

-- PROVINCIA: Chayanta (Colquechaca, Pocoata, Ravelo, Ocurí, Surihaya)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_chayanta_id, 'Colquechaca', NULL),
(@prov_pt_chayanta_id, 'Pocoata', NULL),
(@prov_pt_chayanta_id, 'Ravelo', NULL),
(@prov_pt_chayanta_id, 'Ocurí', NULL),
(@prov_pt_chayanta_id, 'Surihaya', NULL);

-- PROVINCIA: Cornelio Saavedra (Betanzos, Chaquí, Tacobamba)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_cornelio_saavedra_id, 'Betanzos', NULL),
(@prov_pt_cornelio_saavedra_id, 'Chaquí', NULL),
(@prov_pt_cornelio_saavedra_id, 'Tacobamba', NULL);

-- PROVINCIA: Charcas (San Pedro de Buena Vista, Toro Toro)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_charcas_id, 'San Pedro de Buena Vista', NULL),
(@prov_pt_charcas_id, 'Toro Toro', NULL);

-- PROVINCIA: Nor Chichas (Cotagaita, Vitichi, Sagrario, Tacachira)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_nor_chichas_id, 'Cotagaita', NULL),
(@prov_pt_nor_chichas_id, 'Vitichi', NULL),
(@prov_pt_nor_chichas_id, 'Sagrario', NULL),
(@prov_pt_nor_chichas_id, 'Tacachira', NULL);

-- PROVINCIA: Sud Chichas (Tupiza, Atocha, Esmoraca, Mojinete, San Pablo de Lípez)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_sud_chichas_id, 'Tupiza', NULL),
(@prov_pt_sud_chichas_id, 'Atocha', NULL),
(@prov_pt_sud_chichas_id, 'Esmoraca', NULL),
(@prov_pt_sud_chichas_id, 'Mojinete', NULL),
(@prov_pt_sud_chichas_id, 'San Pablo de Lípez', NULL);

-- PROVINCIA: Nor Lípez (Colcha K, San Pedro de Quemes, Llica)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_nor_lipez_id, 'Colcha K', NULL),
(@prov_pt_nor_lipez_id, 'San Pedro de Quemes', NULL),
(@prov_pt_nor_lipez_id, 'Llica', NULL);

-- PROVINCIA: Sud Lípez (San Pablo de Lípez, San Antonio de Esmoruco)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_sud_lipez_id, 'San Pablo de Lípez', NULL),
(@prov_pt_sud_lipez_id, 'San Antonio de Esmoruco', NULL);

-- PROVINCIA: José María Linares (Puna, Caiza D, Ckochas, Yocalla)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_jose_maria_linares_id, 'Puna', NULL),
(@prov_pt_jose_maria_linares_id, 'Caiza D', NULL),
(@prov_pt_jose_maria_linares_id, 'Ckochas', NULL);

-- PROVINCIA: Antonio Quijarro (Uyuni, Tomave, Porco)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_antonio_quijarro_id, 'Uyuni', NULL),
(@prov_pt_antonio_quijarro_id, 'Tomave', NULL),
(@prov_pt_antonio_quijarro_id, 'Porco', NULL);

-- PROVINCIA: Modesto Omiste (Villazón, Tarija)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_modesto_omiste_id, 'Villazón', NULL);

-- PROVINCIA: Enrique Baldivieso (San Agustín)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_enrique_baldivieso_id, 'San Agustín', NULL);

-- PROVINCIA: Daniel Campos (Llica, Tahua)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_daniel_campos_id, 'Llica', NULL),
(@prov_pt_daniel_campos_id, 'Tahua', NULL);

-- PROVINCIA: Alonso de Ibáñez (Sacaca, Caripuyo)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_alonso_ibanez_id, 'Sacaca', NULL),
(@prov_pt_alonso_ibanez_id, 'Caripuyo', NULL);

-- PROVINCIA: Bernardino Bilbao (Arampampa, Acasio)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pt_bernardino_bilbao_id, 'Arampampa', NULL),
(@prov_pt_bernardino_bilbao_id, 'Acasio', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - CHUQUISACA
-- ============================================

-- Variables de provincias de Chuquisaca
SET @prov_ch_azurduy_id = (SELECT id FROM provincias WHERE nombre = 'Azurduy' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_belisario_boeto_id = (SELECT id FROM provincias WHERE nombre = 'Belisario Boeto' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_hernando_siles_id = (SELECT id FROM provincias WHERE nombre = 'Hernando Siles' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_jaime_zudanez_id = (SELECT id FROM provincias WHERE nombre = 'Jaime Zudáñez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_luis_calvo_id = (SELECT id FROM provincias WHERE nombre = 'Luis Calvo' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_nor_cinti_id = (SELECT id FROM provincias WHERE nombre = 'Nor Cinti' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_oropeza_id = (SELECT id FROM provincias WHERE nombre = 'Oropeza' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_sud_cinti_id = (SELECT id FROM provincias WHERE nombre = 'Sud Cinti' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_tomina_id = (SELECT id FROM provincias WHERE nombre = 'Tomina' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);
SET @prov_ch_yamparaez_id = (SELECT id FROM provincias WHERE nombre = 'Yamparáez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'CH' LIMIT 1) LIMIT 1);

-- PROVINCIA: Oropeza (Sucre, Yotala, Poroma)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_oropeza_id, 'Sucre', NULL),
(@prov_ch_oropeza_id, 'Yotala', NULL),
(@prov_ch_oropeza_id, 'Poroma', NULL);

-- PROVINCIA: Yamparáez (Tarabuco, Yamparáez)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_yamparaez_id, 'Tarabuco', NULL),
(@prov_ch_yamparaez_id, 'Yamparáez', NULL);

-- PROVINCIA: Zudáñez (Villa Zudáñez, Presto, Mojocoya, Icla)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_jaime_zudanez_id, 'Villa Zudáñez', NULL),
(@prov_ch_jaime_zudanez_id, 'Presto', NULL),
(@prov_ch_jaime_zudanez_id, 'Mojocoya', NULL),
(@prov_ch_jaime_zudanez_id, 'Icla', NULL);

-- PROVINCIA: Tomina (Padilla, Tomina, Sopachuy, Villa Alcalá, El Villar, Monteagudo)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_tomina_id, 'Padilla', NULL),
(@prov_ch_tomina_id, 'Tomina', NULL),
(@prov_ch_tomina_id, 'Sopachuy', NULL),
(@prov_ch_tomina_id, 'Villa Alcalá', NULL),
(@prov_ch_tomina_id, 'El Villar', NULL),
(@prov_ch_tomina_id, 'Monteagudo', NULL);

-- PROVINCIA: Hernando Siles (Monteagudo, Huacareta, Macharetí, Villa Vaca Guzmán)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_hernando_siles_id, 'Monteagudo', NULL),
(@prov_ch_hernando_siles_id, 'Huacareta', NULL),
(@prov_ch_hernando_siles_id, 'Macharetí', NULL),
(@prov_ch_hernando_siles_id, 'Villa Vaca Guzmán', NULL);

-- PROVINCIA: Belisario Boeto (Villa Serrano, Las Carreras)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_belisario_boeto_id, 'Villa Serrano', NULL),
(@prov_ch_belisario_boeto_id, 'Las Carreras', NULL);

-- PROVINCIA: Nor Cinti (Camargo, San Lucas, Incahuasi, Villa Charcas)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_nor_cinti_id, 'Camargo', NULL),
(@prov_ch_nor_cinti_id, 'San Lucas', NULL),
(@prov_ch_nor_cinti_id, 'Incahuasi', NULL),
(@prov_ch_nor_cinti_id, 'Villa Charcas', NULL);

-- PROVINCIA: Sud Cinti (Villa Abecia, Culpina, Las Carreras, Camataquí)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_sud_cinti_id, 'Villa Abecia', NULL),
(@prov_ch_sud_cinti_id, 'Culpina', NULL),
(@prov_ch_sud_cinti_id, 'Las Carreras', NULL),
(@prov_ch_sud_cinti_id, 'Camataquí', NULL);

-- PROVINCIA: Azurduy (Azurduy, Tarvita)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_azurduy_id, 'Azurduy', NULL),
(@prov_ch_azurduy_id, 'Tarvita', NULL);

-- PROVINCIA: Luis Calvo (Villa Vaca Guzmán, Huacaya, Macharetí, Boyuibe)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_ch_luis_calvo_id, 'Villa Vaca Guzmán', NULL),
(@prov_ch_luis_calvo_id, 'Huacaya', NULL),
(@prov_ch_luis_calvo_id, 'Macharetí', NULL),
(@prov_ch_luis_calvo_id, 'Boyuibe', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - ORURO
-- ============================================

-- Variables de provincias de Oruro
SET @prov_or_atahuallpa_id = (SELECT id FROM provincias WHERE nombre = 'Atahuallpa' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_carangas_id = (SELECT id FROM provincias WHERE nombre = 'Carangas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_cercado_id = (SELECT id FROM provincias WHERE nombre = 'Cercado' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_eduardo_avaroa_id = (SELECT id FROM provincias WHERE nombre = 'Eduardo Avaroa' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_ladislao_cabrera_id = (SELECT id FROM provincias WHERE nombre = 'Ladislao Cabrera' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_litoral_id = (SELECT id FROM provincias WHERE nombre = 'Litoral' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_mejillones_id = (SELECT id FROM provincias WHERE nombre = 'Mejillones' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_nor_carangas_id = (SELECT id FROM provincias WHERE nombre = 'Nor Carangas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_pantaleon_dalence_id = (SELECT id FROM provincias WHERE nombre = 'Pantaleón Dalence' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_poopo_id = (SELECT id FROM provincias WHERE nombre = 'Poopó' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_sajama_id = (SELECT id FROM provincias WHERE nombre = 'Sajama' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_san_pedro_totora_id = (SELECT id FROM provincias WHERE nombre = 'San Pedro de Totora' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_saucari_id = (SELECT id FROM provincias WHERE nombre = 'Saucarí' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_sebastian_pagador_id = (SELECT id FROM provincias WHERE nombre = 'Sebastián Pagador' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_sud_carangas_id = (SELECT id FROM provincias WHERE nombre = 'Sud Carangas' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);
SET @prov_or_tomas_barron_id = (SELECT id FROM provincias WHERE nombre = 'Tomas Barrón' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'OR' LIMIT 1) LIMIT 1);

-- PROVINCIA: Cercado (Oruro, Caracollo, El Choro, Soracachi)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_cercado_id, 'Oruro', NULL),
(@prov_or_cercado_id, 'Caracollo', NULL),
(@prov_or_cercado_id, 'El Choro', NULL),
(@prov_or_cercado_id, 'Soracachi', NULL);

-- PROVINCIA: Carangas (Corque, Choque Cota)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_carangas_id, 'Corque', NULL),
(@prov_or_carangas_id, 'Choque Cota', NULL);

-- PROVINCIA: Pantaleón Dalence (Huanuni, Machacamarca)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_pantaleon_dalence_id, 'Huanuni', NULL),
(@prov_or_pantaleon_dalence_id, 'Machacamarca', NULL);

-- PROVINCIA: Poopó (Poopó, Pazña, Antequera, Puna)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_poopo_id, 'Poopó', NULL),
(@prov_or_poopo_id, 'Pazña', NULL),
(@prov_or_poopo_id, 'Antequera', NULL),
(@prov_or_poopo_id, 'Puna', NULL);

-- PROVINCIA: Saucarí (Toledo, Santiago de Huari)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_saucari_id, 'Toledo', NULL),
(@prov_or_saucari_id, 'Santiago de Huari', NULL);

-- PROVINCIA: Sebastián Pagador (Santiago de Huari, Santuario de Quillacas)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_sebastian_pagador_id, 'Santiago de Huari', NULL),
(@prov_or_sebastian_pagador_id, 'Santuario de Quillacas', NULL);

-- PROVINCIA: Nor Carangas (Huachacalla)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_nor_carangas_id, 'Huachacalla', NULL);

-- PROVINCIA: Sud Carangas (Andamarca, Belén de Andamarca)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_sud_carangas_id, 'Andamarca', NULL),
(@prov_or_sud_carangas_id, 'Belén de Andamarca', NULL);

-- PROVINCIA: Ladislao Cabrera (Salinas de Garci Mendoza)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_ladislao_cabrera_id, 'Salinas de Garci Mendoza', NULL);

-- PROVINCIA: Litoral (Cruz de Machacamarca, Esmeralda, Eucaliptus)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_litoral_id, 'Cruz de Machacamarca', NULL),
(@prov_or_litoral_id, 'Esmeralda', NULL),
(@prov_or_litoral_id, 'Eucaliptus', NULL);

-- PROVINCIA: Sajama (Curahuara de Carangas, Turco)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_sajama_id, 'Curahuara de Carangas', NULL),
(@prov_or_sajama_id, 'Turco', NULL);

-- PROVINCIA: San Pedro de Totora (Totora)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_san_pedro_totora_id, 'Totora', NULL);

-- PROVINCIA: Tomas Barrón (Eucaliptus, La Rivera)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_tomas_barron_id, 'Eucaliptus', NULL),
(@prov_or_tomas_barron_id, 'La Rivera', NULL);

-- PROVINCIA: Atahuallpa (Sabaya, Coipasa, Chipaya)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_atahuallpa_id, 'Sabaya', NULL),
(@prov_or_atahuallpa_id, 'Coipasa', NULL),
(@prov_or_atahuallpa_id, 'Chipaya', NULL);

-- PROVINCIA: Eduardo Avaroa (Challapata, Quillacas, Santuario de Quillacas)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_eduardo_avaroa_id, 'Challapata', NULL),
(@prov_or_eduardo_avaroa_id, 'Quillacas', NULL),
(@prov_or_eduardo_avaroa_id, 'Santuario de Quillacas', NULL);

-- PROVINCIA: Mejillones (La Rivera, Todos Santos, Esmeralda)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_or_mejillones_id, 'La Rivera', NULL),
(@prov_or_mejillones_id, 'Todos Santos', NULL),
(@prov_or_mejillones_id, 'Esmeralda', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - TARIJA
-- ============================================

-- Variables de provincias de Tarija
SET @prov_tj_aniceto_arce_id = (SELECT id FROM provincias WHERE nombre = 'Aniceto Arce' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1) LIMIT 1);
SET @prov_tj_burnet_oconnor_id = (SELECT id FROM provincias WHERE nombre = 'Burnet O''Connor' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1) LIMIT 1);
SET @prov_tj_cercado_id = (SELECT id FROM provincias WHERE nombre = 'Cercado' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1) LIMIT 1);
SET @prov_tj_eustaquio_mendez_id = (SELECT id FROM provincias WHERE nombre = 'Eustaquio Méndez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1) LIMIT 1);
SET @prov_tj_gran_chaco_id = (SELECT id FROM provincias WHERE nombre = 'Gran Chaco' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1) LIMIT 1);
SET @prov_tj_jose_maria_aviles_id = (SELECT id FROM provincias WHERE nombre = 'José María Avilés' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'TJ' LIMIT 1) LIMIT 1);

-- PROVINCIA: Cercado (Tarija, Uriondo, Yunchará)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_cercado_id, 'Tarija', NULL),
(@prov_tj_cercado_id, 'Uriondo', NULL),
(@prov_tj_cercado_id, 'Yunchará', NULL);

-- PROVINCIA: Aniceto Arce (Padcaya, Bermejo)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_aniceto_arce_id, 'Padcaya', NULL),
(@prov_tj_aniceto_arce_id, 'Bermejo', NULL);

-- PROVINCIA: Gran Chaco (Yacuiba, Caraparí, Villa Montes)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_gran_chaco_id, 'Yacuiba', NULL),
(@prov_tj_gran_chaco_id, 'Caraparí', NULL),
(@prov_tj_gran_chaco_id, 'Villa Montes', NULL);

-- PROVINCIA: Méndez (San Lorenzo, El Puente)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_eustaquio_mendez_id, 'San Lorenzo', NULL),
(@prov_tj_eustaquio_mendez_id, 'El Puente', NULL);

-- PROVINCIA: Arce (Entre Ríos)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_aniceto_arce_id, 'Entre Ríos', NULL);

-- PROVINCIA: Burnet O''Connor (Villa Montes)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_burnet_oconnor_id, 'Villa Montes', NULL);

-- PROVINCIA: Avilés (Yunchará, Iscayachi)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_tj_jose_maria_aviles_id, 'Yunchará', NULL),
(@prov_tj_jose_maria_aviles_id, 'Iscayachi', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - BENI
-- ============================================

-- Variables de provincias de Beni
SET @prov_bn_cercado_id = (SELECT id FROM provincias WHERE nombre = 'Cercado' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_itenez_id = (SELECT id FROM provincias WHERE nombre = 'Iténez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_jose_ballivian_id = (SELECT id FROM provincias WHERE nombre = 'José Ballivián' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_mamore_id = (SELECT id FROM provincias WHERE nombre = 'Mamoré' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_marban_id = (SELECT id FROM provincias WHERE nombre = 'Marbán' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_moxos_id = (SELECT id FROM provincias WHERE nombre = 'Moxos' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_vaca_diez_id = (SELECT id FROM provincias WHERE nombre = 'Vaca Díez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);
SET @prov_bn_yacuma_id = (SELECT id FROM provincias WHERE nombre = 'Yacuma' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'BN' LIMIT 1) LIMIT 1);

-- PROVINCIA: Cercado (Trinidad, San Javier)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_cercado_id, 'Trinidad', NULL),
(@prov_bn_cercado_id, 'San Javier', NULL);

-- PROVINCIA: Iténez (Magdalena, Baures, Huacaraje)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_itenez_id, 'Magdalena', NULL),
(@prov_bn_itenez_id, 'Baures', NULL),
(@prov_bn_itenez_id, 'Huacaraje', NULL);

-- PROVINCIA: Mamoré (San Joaquín, San Ramón, Puerto Siles)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_mamore_id, 'San Joaquín', NULL),
(@prov_bn_mamore_id, 'San Ramón', NULL),
(@prov_bn_mamore_id, 'Puerto Siles', NULL);

-- PROVINCIA: Marbán (Loreto, San Andrés)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_marban_id, 'Loreto', NULL),
(@prov_bn_marban_id, 'San Andrés', NULL);

-- PROVINCIA: Moxos (San Ignacio, San Javier)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_moxos_id, 'San Ignacio', NULL),
(@prov_bn_moxos_id, 'San Javier', NULL);

-- PROVINCIA: Ballivián (Rurrenabaque, Reyes, San Borja, Santa Rosa, Rurrenabaque)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_jose_ballivian_id, 'Rurrenabaque', NULL),
(@prov_bn_jose_ballivian_id, 'Reyes', NULL),
(@prov_bn_jose_ballivian_id, 'San Borja', NULL),
(@prov_bn_jose_ballivian_id, 'Santa Rosa', NULL);

-- PROVINCIA: Yacuma (Santa Ana del Yacuma, Exaltación)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_yacuma_id, 'Santa Ana del Yacuma', NULL),
(@prov_bn_yacuma_id, 'Exaltación', NULL);

-- PROVINCIA: Vaca Díez (Riberalta, Guayaramerín)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_bn_vaca_diez_id, 'Riberalta', NULL),
(@prov_bn_vaca_diez_id, 'Guayaramerín', NULL);

-- ============================================
-- INSERTAR MUNICIPIOS - PANDO
-- ============================================

-- Variables de provincias de Pando
SET @prov_pd_abuna_id = (SELECT id FROM provincias WHERE nombre = 'Abuná' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PD' LIMIT 1) LIMIT 1);
SET @prov_pd_federico_roman_id = (SELECT id FROM provincias WHERE nombre = 'Federico Román' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PD' LIMIT 1) LIMIT 1);
SET @prov_pd_madre_dios_id = (SELECT id FROM provincias WHERE nombre = 'Madre de Dios' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PD' LIMIT 1) LIMIT 1);
SET @prov_pd_manuripi_id = (SELECT id FROM provincias WHERE nombre = 'Manuripi' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PD' LIMIT 1) LIMIT 1);
SET @prov_pd_nicolas_suarez_id = (SELECT id FROM provincias WHERE nombre = 'Nicolás Suárez' AND departamento_id = (SELECT id FROM departamentos WHERE codigo = 'PD' LIMIT 1) LIMIT 1);

-- PROVINCIA: Nicolás Suárez (Cobija, Porvenir, Filadelfia, Bella Flor, Bolpebra)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pd_nicolas_suarez_id, 'Cobija', NULL),
(@prov_pd_nicolas_suarez_id, 'Porvenir', NULL),
(@prov_pd_nicolas_suarez_id, 'Filadelfia', NULL),
(@prov_pd_nicolas_suarez_id, 'Bella Flor', NULL),
(@prov_pd_nicolas_suarez_id, 'Bolpebra', NULL);

-- PROVINCIA: Manuripi (Puerto Rico, San Pedro)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pd_manuripi_id, 'Puerto Rico', NULL),
(@prov_pd_manuripi_id, 'San Pedro', NULL);

-- PROVINCIA: Madre de Dios (Puerto Gonzalo Moreno, El Sena)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pd_madre_dios_id, 'Puerto Gonzalo Moreno', NULL),
(@prov_pd_madre_dios_id, 'El Sena', NULL);

-- PROVINCIA: Federico Román (Nueva Esperanza, Villa Nueva, Santos Mercado)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pd_federico_roman_id, 'Nueva Esperanza', NULL),
(@prov_pd_federico_roman_id, 'Villa Nueva', NULL),
(@prov_pd_federico_roman_id, 'Santos Mercado', NULL);

-- PROVINCIA: Abuná (Ingavi, Nueva Esperanza)
INSERT INTO municipios (provincia_id, nombre, codigo) VALUES
(@prov_pd_abuna_id, 'Ingavi', NULL),
(@prov_pd_abuna_id, 'Nueva Esperanza', NULL);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- Este seeder incluye todos los municipios de Bolivia (aproximadamente 340 municipios).
-- Datos estándar geográficos del sistema.
-- ============================================

