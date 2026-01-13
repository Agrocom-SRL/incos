-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (TARDE), PRIMERO C (NOCHE), PRIMERO D (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO A (TARDE)
-- ============================================

SET @curso_1a_con101 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-CON101' LIMIT 1);
SET @curso_1a_maf102 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-MAF102' LIMIT 1);
SET @curso_1a_ico103 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-ICO103' LIMIT 1);
SET @curso_1a_adg104 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-ADG104' LIMIT 1);
SET @curso_1a_lsa105 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-LSA105' LIMIT 1);
SET @curso_1a_ega106 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-EGA106' LIMIT 1);
SET @curso_1a_dcm107 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-DCM107' LIMIT 1);
SET @curso_1a_esa108 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-ESA108' LIMIT 1);
SET @curso_1a_int109 = (SELECT id FROM cursos WHERE codigo = 'CON-1A-TARDE-INT109' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO B (TARDE)
-- ============================================

SET @curso_1b_con101 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-CON101' LIMIT 1);
SET @curso_1b_maf102 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-MAF102' LIMIT 1);
SET @curso_1b_ico103 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-ICO103' LIMIT 1);
SET @curso_1b_adg104 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-ADG104' LIMIT 1);
SET @curso_1b_lsa105 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-LSA105' LIMIT 1);
SET @curso_1b_ega106 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-EGA106' LIMIT 1);
SET @curso_1b_dcm107 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-DCM107' LIMIT 1);
SET @curso_1b_esa108 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-ESA108' LIMIT 1);
SET @curso_1b_int109 = (SELECT id FROM cursos WHERE codigo = 'CON-1B-TARDE-INT109' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO C (NOCHE)
-- ============================================

SET @curso_1c_con101 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-CON101' LIMIT 1);
SET @curso_1c_maf102 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-MAF102' LIMIT 1);
SET @curso_1c_ico103 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-ICO103' LIMIT 1);
SET @curso_1c_adg104 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-ADG104' LIMIT 1);
SET @curso_1c_lsa105 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-LSA105' LIMIT 1);
SET @curso_1c_ega106 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-EGA106' LIMIT 1);
SET @curso_1c_dcm107 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-DCM107' LIMIT 1);
SET @curso_1c_esa108 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-ESA108' LIMIT 1);
SET @curso_1c_int109 = (SELECT id FROM cursos WHERE codigo = 'CON-1C-NOCHE-INT109' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO D (NOCHE)
-- ============================================

SET @curso_1d_con101 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-CON101' LIMIT 1);
SET @curso_1d_maf102 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-MAF102' LIMIT 1);
SET @curso_1d_ico103 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-ICO103' LIMIT 1);
SET @curso_1d_adg104 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-ADG104' LIMIT 1);
SET @curso_1d_lsa105 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-LSA105' LIMIT 1);
SET @curso_1d_ega106 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-EGA106' LIMIT 1);
SET @curso_1d_dcm107 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-DCM107' LIMIT 1);
SET @curso_1d_esa108 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-ESA108' LIMIT 1);
SET @curso_1d_int109 = (SELECT id FROM cursos WHERE codigo = 'CON-1D-NOCHE-INT109' LIMIT 1);

-- ============================================
-- OBTENER IDs DE AULAS
-- ============================================

SET @aula_lab1 = (SELECT id FROM aulas WHERE codigo = 'LAB-1' LIMIT 1);
SET @aula_lab2 = (SELECT id FROM aulas WHERE codigo = 'LAB-2' LIMIT 1);

-- ============================================
-- PRIMERO A - TARDE
-- ============================================

-- CONTABILIDAD I (8 horas/semana)
-- JUEVES (4 bloques) + VIERNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 5),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 6),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 7),
(@curso_1a_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 8);

-- MATEMÁTICA FINANCIERA (4 horas/semana)
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- INFORMÁTICA CONTABLE (4 horas/semana) LAB 1
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 1),
(@curso_1a_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 2),
(@curso_1a_ico103, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 3),
(@curso_1a_ico103, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 4);

-- ADMINISTRACIÓN GENERAL (4 horas/semana)
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (2 horas/semana)
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- ECONOMÍA GENERAL APLICADA (2 horas/semana)
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (2 horas/semana)
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- ESTADÍSTICA APLICADA (2 horas/semana)
-- VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- INGLÉS (2 horas/semana)
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- ============================================
-- PRIMERO B - TARDE (Replica de PRIMERO A)
-- ============================================

-- CONTABILIDAD I (8 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 5),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 6),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 7),
(@curso_1b_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 8);

-- MATEMÁTICA FINANCIERA (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1b_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1b_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- INFORMÁTICA CONTABLE (4 horas/semana) LAB 2
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab2, 1),
(@curso_1b_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab2, 2),
(@curso_1b_ico103, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab2, 3),
(@curso_1b_ico103, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab2, 4);

-- ADMINISTRACIÓN GENERAL (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1b_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1b_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- ECONOMÍA GENERAL APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- ESTADÍSTICA APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- INGLÉS (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1b_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- ============================================
-- PRIMERO C - NOCHE
-- ============================================

-- CONTABILIDAD I (8 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 6),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 7),
(@curso_1c_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 8);

-- MATEMÁTICA FINANCIERA (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1c_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1c_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- INFORMÁTICA CONTABLE (4 horas/semana) LAB 1
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 1),
(@curso_1c_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 2),
(@curso_1c_ico103, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 3),
(@curso_1c_ico103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 4);

-- ADMINISTRACIÓN GENERAL (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1c_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1c_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- ECONOMÍA GENERAL APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- ESTADÍSTICA APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- INGLÉS (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1c_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1c_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- ============================================
-- PRIMERO D - NOCHE (Replica de PRIMERO C)
-- ============================================

-- CONTABILIDAD I (8 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 6),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 7),
(@curso_1d_con101, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 8);

-- MATEMÁTICA FINANCIERA (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1d_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1d_maf102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- INFORMÁTICA CONTABLE (4 horas/semana) LAB 2
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab2, 1),
(@curso_1d_ico103, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab2, 2),
(@curso_1d_ico103, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab2, 3),
(@curso_1d_ico103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab2, 4);

-- ADMINISTRACIÓN GENERAL (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1d_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1d_adg104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_lsa105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- ECONOMÍA GENERAL APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_ega106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_dcm107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- ESTADÍSTICA APLICADA (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_esa108, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- INGLÉS (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1d_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1d_int109, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 9 cursos × ~3 bloques = ~36 registros
-- PARALELO B (TARDE): 9 cursos × ~3 bloques = ~36 registros
-- PARALELO C (NOCHE): 9 cursos × ~3 bloques = ~36 registros
-- PARALELO D (NOCHE): 9 cursos × ~3 bloques = ~36 registros
-- TOTAL: ~144 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
