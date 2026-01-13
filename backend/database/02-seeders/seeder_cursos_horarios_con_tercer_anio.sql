-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: TERCERO A (TARDE), TERCERO B (TARDE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - TERCERO A (TARDE)
-- ============================================

SET @curso_3a_coa301 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-COA301' LIMIT 1);
SET @curso_3a_coc302 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-COC302' LIMIT 1);
SET @curso_3a_cog303 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-COG303' LIMIT 1);
SET @curso_3a_cep304 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-CEP304' LIMIT 1);
SET @curso_3a_chs305 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-CHS305' LIMIT 1);
SET @curso_3a_gci306 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-GCI306' LIMIT 1);
SET @curso_3a_aef307 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-AEF307' LIMIT 1);
SET @curso_3a_tmg308 = (SELECT id FROM cursos WHERE codigo = 'CON-3A-TARDE-TMG308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - TERCERO B (TARDE)
-- ============================================

SET @curso_3b_coa301 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-COA301' LIMIT 1);
SET @curso_3b_coc302 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-COC302' LIMIT 1);
SET @curso_3b_cog303 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-COG303' LIMIT 1);
SET @curso_3b_cep304 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-CEP304' LIMIT 1);
SET @curso_3b_chs305 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-CHS305' LIMIT 1);
SET @curso_3b_gci306 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-GCI306' LIMIT 1);
SET @curso_3b_aef307 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-AEF307' LIMIT 1);
SET @curso_3b_tmg308 = (SELECT id FROM cursos WHERE codigo = 'CON-3B-TARDE-TMG308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE AULAS
-- ============================================

SET @aula_lab1 = (SELECT id FROM aulas WHERE codigo = 'LAB-1' LIMIT 1);

-- ============================================
-- TERCERO A - TARDE
-- ============================================

-- CONTABILIDAD AGROPECUARIA (4 horas/semana)
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3a_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3a_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD DE COSTOS II (4 horas/semana)
-- JUEVES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3a_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3a_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD GUBERNAMENTAL (4 horas/semana)
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_cog303, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_cog303, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3a_cog303, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3a_cog303, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD EXTRACTIVA Y DE PETROLERA (4 horas/semana)
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3a_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3a_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD HOTELERA Y DE SERVICIOS (2 horas/semana)
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_chs305, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_chs305, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- GABINETE CONTABLE INFORMÁTICO (4 horas/semana) LAB 1
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_gci306, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 1),
(@curso_3a_gci306, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 2),
(@curso_3a_gci306, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 3),
(@curso_3a_gci306, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 4);

-- ANÁLISIS E INTERPRETACIONES DE ESTADOS FINANCIEROS (4 horas/semana)
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3a_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3a_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- TALLER DE MODALIDAD DE GRADUACIÓN (4 horas/semana)
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3a_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3a_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3a_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ============================================
-- TERCERO B - TARDE (Replica de TERCERO A)
-- ============================================

-- CONTABILIDAD AGROPECUARIA (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3b_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3b_coa301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD DE COSTOS II (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3b_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3b_coc302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD GUBERNAMENTAL (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_cog303, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_cog303, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3b_cog303, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3b_cog303, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD EXTRACTIVA Y DE PETROLERA (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3b_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3b_cep304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD HOTELERA Y DE SERVICIOS (2 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_chs305, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_chs305, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- GABINETE CONTABLE INFORMÁTICO (4 horas/semana) LAB 1
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_gci306, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 1),
(@curso_3b_gci306, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 2),
(@curso_3b_gci306, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 3),
(@curso_3b_gci306, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), @aula_lab1, 4);

-- ANÁLISIS E INTERPRETACIONES DE ESTADOS FINANCIEROS (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3b_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3b_aef307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- TALLER DE MODALIDAD DE GRADUACIÓN (4 horas/semana)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3b_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_3b_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_3b_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_3b_tmg308, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 8 cursos × ~4 bloques = ~30 registros
-- PARALELO B (TARDE): 8 cursos × ~4 bloques = ~30 registros
-- TOTAL: ~60 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
