-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO A (TARDE)
-- ============================================

SET @curso_1a_fua101 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-FUA101' LIMIT 1);
SET @curso_1a_cga102 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-CGA102' LIMIT 1);
SET @curso_1a_maf103 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-MAF103' LIMIT 1);
SET @curso_1a_esn104 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-ESN104' LIMIT 1);
SET @curso_1a_plt105 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-PLT105' LIMIT 1);
SET @curso_1a_ife106 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-IFE106' LIMIT 1);
SET @curso_1a_int107 = (SELECT id FROM cursos WHERE codigo = 'ADM-1A-TARDE-INT107' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO B (NOCHE)
-- ============================================

SET @curso_1b_fua101 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-FUA101' LIMIT 1);
SET @curso_1b_cga102 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-CGA102' LIMIT 1);
SET @curso_1b_maf103 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-MAF103' LIMIT 1);
SET @curso_1b_esn104 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-ESN104' LIMIT 1);
SET @curso_1b_plt105 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-PLT105' LIMIT 1);
SET @curso_1b_ife106 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-IFE106' LIMIT 1);
SET @curso_1b_int107 = (SELECT id FROM cursos WHERE codigo = 'ADM-1B-NOCHE-INT107' LIMIT 1);

-- ============================================
-- OBTENER IDs DE AULAS
-- ============================================

SET @aula_lab1 = (SELECT id FROM aulas WHERE codigo = 'LAB-1' LIMIT 1);

-- ============================================
-- PRIMERO A - TARDE
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (6 horas/semana)
-- LUNES (4 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4),
(@curso_1a_fua101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 5),
(@curso_1a_fua101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 6);

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (6 horas/semana)
-- MIÉRCOLES (4 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4),
(@curso_1a_cga102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 5),
(@curso_1a_cga102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 6);

-- MATEMÁTICA FINANCIERA (4 horas/semana)
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ESTADÍSTICA PARA LOS NEGOCIOS (4 horas/semana)
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- PRÁCTICA LABORAL Y TRIBUTARIA (4 horas/semana)
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_plt105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_plt105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_plt105, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_plt105, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- INFORMÁTICA EMPRESARIAL (2 horas/semana) LAB 1
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_ife106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 1),
(@curso_1a_ife106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 2);

-- INGLÉS TÉCNICO (4 horas/semana)
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_int107, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_1a_int107, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_1a_int107, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_1a_int107, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ============================================
-- PRIMERO B - NOCHE
-- ============================================
-- NOTA: Los horarios de PRIMERO B se copiarán del mismo patrón
-- pero adaptados al turno NOCHE (18:15-22:00)

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (6 horas/semana)
-- LUNES (4 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1b_fua101, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_1b_fua101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5),
(@curso_1b_fua101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 6);

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (6 horas/semana)
-- MIÉRCOLES (4 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1b_cga102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_1b_cga102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5),
(@curso_1b_cga102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 6);

-- MATEMÁTICA FINANCIERA (4 horas/semana)
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1b_maf103, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '22:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- ESTADÍSTICA PARA LOS NEGOCIOS (4 horas/semana)
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1b_esn104, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- PRÁCTICA LABORAL Y TRIBUTARIA (4 horas/semana)
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_plt105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_plt105, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_plt105, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1b_plt105, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- INFORMÁTICA EMPRESARIAL (2 horas/semana) LAB 1
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_ife106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 1),
(@curso_1b_ife106, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 2);

-- INGLÉS TÉCNICO (4 horas/semana)
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_int107, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_int107, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_int107, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_1b_int107, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 7 cursos × ~4 bloques = ~30 registros
-- PARALELO B (NOCHE): 7 cursos × ~4 bloques = ~30 registros
-- TOTAL: ~60 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
