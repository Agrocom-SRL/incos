-- ============================================
-- MIGRACIÓN DE DATOS: estudiantes
-- Origen: instituto_incos.sql
-- Ajustes al schema actual: se agregan trabaja=0, empresa_institucion=NULL, cargo=NULL
-- Ejecutar después de tener tablas vacías (01-schemas ya aplicados)
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO estudiantes (
  id, usuario_id, codigo_estudiante, ci, expedicion, nombres, apellido_paterno, apellido_materno,
  fecha_nacimiento, genero, estado_civil_id, tipo_sangre, tiene_discapacidad, email_personal,
  celular, telefono_fijo, direccion, municipio_residencia_id, zona,
  trabaja, empresa_institucion, cargo, observaciones,
  activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by
) VALUES
(1, NULL, '20260001', '9733925', NULL, 'JHONATAN MANUEL', 'LEQUIPE', 'PACO', '1993-05-11', 'MASCULINO', 2, 'ARH (+)', 0, 'gionatanlp@gmail.com', '73127591', NULL, NULL, 1, '3er anillo interno calle Darío Leigue N°3005', 0, NULL, NULL, NULL, 1, '2026-01-30 14:07:33', '2026-01-30 14:58:44', NULL, NULL, NULL, NULL),
(2, NULL, '20260002', '11343943', NULL, 'JUSTO ELHID', 'OTTA', 'MOLE', '2008-04-21', 'MASCULINO', 1, 'ORH (+)', 0, 'ottamolejusto@gmail.com', '69874737', NULL, 'BARRIO AUTONOMIA', 1, 'ENTRE 8° Y 9° ANILLO', 0, NULL, NULL, NULL, 1, '2026-01-30 15:35:50', '2026-01-30 15:35:50', NULL, NULL, NULL, NULL),
(3, NULL, '20260003', '9646066', NULL, 'INES', 'CHAMO', 'MASABI', '1993-09-28', 'FEMENINO', 1, 'ORH (+)', 0, 'inesita28993@gmail.com', '76385004', NULL, 'BARRIO VILLA WARNES', 1, 'Alto San Pedro', 0, NULL, NULL, NULL, 1, '2026-01-30 15:58:05', '2026-01-30 15:58:05', NULL, NULL, NULL, NULL),
(4, NULL, '20260004', '9701438', NULL, 'DARWIN', 'NAVA', 'ALVIS', '2001-08-08', 'MASCULINO', 1, 'ORH (+)', 0, NULL, '73607627', NULL, '2DO ANILLO AV. BRASIL', NULL, NULL, 0, NULL, NULL, NULL, 0, '2026-01-30 17:54:50', '2026-01-30 17:57:48', '2026-01-30 17:57:48', NULL, NULL, NULL),
(5, NULL, '20260005', '13674448', NULL, 'HERMAN', 'ROMERO', 'PEDRAZA', '2006-04-06', 'MASCULINO', 1, 'ORH (+)', 0, 'romeropredrazaherman36@gmail.com', '62051957', NULL, 'BARRIO TIERRA NUESTRA', 1, 'NORTE VILLA CARMELA', 0, NULL, NULL, NULL, 1, '2026-01-30 18:21:59', '2026-01-30 18:21:59', NULL, NULL, NULL, NULL),
(6, NULL, '20260006', '13333891', NULL, 'FAVIO RICK', 'CORONADO', 'MELENDRES', '2007-06-22', 'MASCULINO', 1, NULL, 0, 'faviodiegocoronado@gmail.com', '74603521', NULL, 'URBANIZACIÓN NUEVA ESPERANZA', 1, 'KM12 DOBLE VIA LA GUARDIA', 0, NULL, NULL, NULL, 1, '2026-01-30 18:37:56', '2026-01-30 18:37:56', NULL, NULL, NULL, NULL),
(7, NULL, '20260007', '13082353', NULL, 'LUIS FERNANDO', 'BELTRAN', 'MAMANI', '2003-12-12', 'MASCULINO', 1, 'ORH (+)', 1, 'luisfernandobeltramamani@gmail.com', '78410228', NULL, 'BARRIO JUANCHO', 1, 'EL PAURITO UV. 14', 0, NULL, NULL, NULL, 1, '2026-01-30 19:24:20', '2026-01-30 19:26:49', NULL, NULL, NULL, NULL),
(8, NULL, '20260008', '8194772', 'CB', 'YESSICA MARGOTH', 'ESPINOZA', 'ZEBALLOS', '1995-07-17', 'FEMENINO', 1, 'ORH (+)', 0, 'yessesza@gmail.com', '74187342', NULL, 'entre calle 3 y 4 n °128', 1, 'barrio soberania nacional', 0, NULL, NULL, NULL, 1, '2026-01-30 21:44:14', '2026-01-30 21:44:14', NULL, NULL, NULL, NULL),
(9, NULL, '20260009', '15035307', NULL, 'BENJAMIN MELVIN', 'ROSALES', 'CARMONA', '2002-05-06', 'MASCULINO', 1, NULL, 0, 'benjaminrosales32@gmail.com', '76939870', NULL, 'avenida Paragua', 1, '4to anillo', 0, NULL, NULL, NULL, 1, '2026-01-30 21:51:08', '2026-01-30 21:51:08', NULL, NULL, NULL, NULL),
(10, NULL, '20260010', '8256665', NULL, 'HEIDY LILIANA', NULL, 'ALVARADO', '1988-08-27', 'FEMENINO', 1, 'ORH (+)', 0, 'lilianaheidy1830@gmail.com', '78017980', NULL, 'AV. MARISCAL SANTA CRUZ', 1, 'BARRIO MONTERREY', 0, NULL, NULL, NULL, 1, '2026-02-02 13:41:27', '2026-02-02 13:41:27', NULL, NULL, NULL, NULL),
(11, NULL, '20260011', '10855741', NULL, 'MIGUEL ANGEL', 'BEJARANO', 'DAMASCO', '2003-09-09', 'MASCULINO', 1, 'ORH (+)', 0, 'miguelangelbejaranodamasco9@gmail.com', '76408499', NULL, 'DISTRITO 6', 1, 'AV. LUJAN', 0, NULL, NULL, NULL, 1, '2026-02-02 14:57:59', '2026-02-02 14:57:59', NULL, NULL, NULL, NULL),
(12, NULL, '20260012', '8114471', NULL, 'ALISON JHERIEL', 'JUSTINIANO', 'ATALA', '2001-04-18', 'FEMENINO', 1, NULL, 0, 'alisonjherieljustinianoatala@gmail.com', '69041907', NULL, NULL, 1, 'entre 5to y 6to anillo Banzer b/los sauces', 0, NULL, NULL, NULL, 1, '2026-02-02 21:37:08', '2026-02-02 21:37:08', NULL, NULL, NULL, NULL),
(13, NULL, '20260013', '9707194', NULL, 'DAVID GUSTAVO', 'SUBIRANA', 'CUELLAR', '2002-10-29', 'MASCULINO', 1, NULL, 0, 'davidgustavosubiranacuellar@gmail.com', '69037258', NULL, NULL, 1, 'Barrio Santa Ana zona lujan calle 1', 0, NULL, NULL, NULL, 1, '2026-02-02 21:50:36', '2026-02-02 21:50:36', NULL, NULL, NULL, NULL),
(14, NULL, '20260014', '14011689', NULL, 'MATIAS ALEXANDER', 'FLORES', 'QUISPE', '2007-10-19', 'MASCULINO', 1, NULL, 0, 'matiasalexanderfloresquispe@gmail.com', '77811973', NULL, NULL, 1, 'AV. CANAL GUAPILO B/SAN JUAN N°4170', 0, NULL, NULL, NULL, 1, '2026-02-02 22:33:21', '2026-02-02 22:33:21', NULL, NULL, NULL, NULL),
(15, NULL, '20260015', '9730521', NULL, 'FABRICIO', 'MENDOZA', 'MONTAÑO', '2006-03-30', 'MASCULINO', 1, 'ORH (+)', 1, NULL, '78984899', NULL, NULL, 1, 'av. santos Dumont 6to anillo distrito 9', 0, NULL, NULL, NULL, 1, '2026-02-03 18:19:08', '2026-02-03 18:19:08', NULL, NULL, NULL, NULL),
(16, NULL, '20260016', '9628345', NULL, 'MARIA ANDREA', 'HURTADO', 'MARMANA', '2005-05-10', 'FEMENINO', 1, 'ORH (+)', 0, 'andreahurtadomarmana@gmail.com', '71070556', NULL, NULL, 1, 'zona norte 8vo anillo urbanización palos verdes', 0, NULL, NULL, NULL, 1, '2026-02-03 18:41:00', '2026-02-03 18:41:00', NULL, NULL, NULL, NULL),
(17, NULL, '20260017', '16017641', NULL, 'JULIANA', 'TOMICHA', 'VIDAURRE', '2005-03-19', 'FEMENINO', 1, NULL, 0, 'julianatomicha19@gmail.com', '76457022', NULL, NULL, 6, 'COMUNIDAD LAS BARRERAS', 0, NULL, NULL, NULL, 1, '2026-02-03 19:32:46', '2026-02-03 19:32:46', NULL, NULL, NULL, NULL),
(18, NULL, '20260018', '8039679', NULL, 'GUSTAVO ADOLFO', 'AMURRIO', 'ZURITA', '1991-12-11', 'MASCULINO', 5, 'ORH (+)', 0, 'amurriozuritagustavoadolfo1191@gmail.com', '75681646', NULL, NULL, 1, 'plan 3000 ZONA LA CAMPANA', 0, NULL, NULL, NULL, 1, '2026-02-03 22:19:50', '2026-02-03 23:02:28', NULL, NULL, NULL, NULL),
(19, NULL, '20260019', '14972716', NULL, 'BENJAMIN', 'MEDRANO', 'LINARES', '2007-03-17', 'MASCULINO', 1, NULL, 0, 'medranobenji2007@gmail.com', '62624393', NULL, NULL, 1, 'calle Manuel castro pinto', 0, NULL, NULL, NULL, 1, '2026-02-03 22:41:53', '2026-02-03 22:41:53', NULL, NULL, NULL, NULL),
(20, NULL, '20260020', '8726866', NULL, 'JHON WILMAN', 'PEREIRA', 'VASQUEZ', '1996-11-03', 'MASCULINO', 1, 'ORH (+)', 0, 'jhonpereira919@gmail.com', '74309163', NULL, NULL, 1, 'ZONA LAS BRISAS 4TO ANILLO FRENTE AL MERCADO 2 DE OCTUBRE', 0, NULL, NULL, NULL, 1, '2026-02-04 21:18:05', '2026-02-04 21:18:05', NULL, NULL, NULL, NULL),
(21, NULL, '20260021', '9032490', NULL, 'YURIKO', 'GUZMAN', 'CHAVEZ', '2008-03-17', 'FEMENINO', 1, NULL, 1, 'yurikoguzman0@gmail.com', '77416457', NULL, NULL, 1, 'BARRIO VILLA FATIMA CALLE EL TORNO N°515', 0, NULL, NULL, NULL, 1, '2026-02-05 17:40:08', '2026-02-05 17:40:08', NULL, NULL, NULL, NULL),
(22, NULL, '20260022', '12479435', NULL, 'JHONY', 'ROJAS', 'ROJAS', '1994-04-26', 'MASCULINO', 5, 'ORH (+)', 0, 'orientista10_10@hotmail.com', '78117345', NULL, NULL, 1, 'AV. LOS CHACOS BARRIO BOLINTER', 0, NULL, NULL, NULL, 1, '2026-02-05 22:47:30', '2026-02-05 22:47:30', NULL, NULL, NULL, NULL),
(23, NULL, '20260023', '13832883', NULL, 'MARCO ANTONIO', 'HUANCA', 'CHAMBI', '2005-09-24', 'MASCULINO', 1, NULL, 0, 'marcohuanca38@gmail.com', '60938876', NULL, NULL, 1, 'Distrito 9 AV. Miguel de Cervantes Barrio Eduardo Salazar', 0, NULL, NULL, NULL, 1, '2026-02-06 17:21:36', '2026-02-06 17:21:36', NULL, NULL, NULL, NULL),
(24, NULL, '20260024', '9232882', NULL, 'MIRIAM GUADALUPE', 'PILLCO', 'CRUZ', '2003-12-11', 'FEMENINO', 1, NULL, 0, 'mirianpillcocruz@gmail.com', '62521952', NULL, NULL, 1, '3er anillo AV. PIRAI M. DE LOS SANTOS RIVERO', 0, NULL, NULL, 'EL DIPLOMA DE BACHILLER ESTA EN TRAMITE DE HOMOLOGACIÓN, LA ESTUDIANTE PRESENTA LA COLILLA DE INGRESO PARA LA HOMOLOGACIÓN.', 1, '2026-02-06 22:38:14', '2026-02-06 22:38:14', NULL, NULL, NULL, NULL),
(25, NULL, '20260025', '8090277', NULL, 'REGINIO', 'SANCHEZ', 'CUELLAR', '1987-07-08', 'MASCULINO', 1, 'ORH (+)', 0, 'regini_o@hotmail.com', '76317466', NULL, NULL, 1, 'DOBLE VIA LA GUARDIA KM6', 0, NULL, NULL, NULL, 1, '2026-02-07 21:55:19', '2026-02-07 21:55:19', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
