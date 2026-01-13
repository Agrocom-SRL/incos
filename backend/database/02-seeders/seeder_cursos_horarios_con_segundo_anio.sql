-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - SEGUNDO A (TARDE)
-- ============================================

SET @curso_2a_con201 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-CON201' LIMIT 1);
SET @curso_2a_coc202 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-COC202' LIMIT 1);
SET @curso_2a_cos203 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-COS203' LIMIT 1);
SET @curso_2a_cds204 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-CDS204' LIMIT 1);
SET @curso_2a_cbc205 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-CBC205' LIMIT 1);
SET @curso_2a_emp206 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-EMP206' LIMIT 1);
SET @curso_2a_sit207 = (SELECT id FROM cursos WHERE codigo = 'CON-2A-TARDE-SIT207' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - SEGUNDO B (NOCHE)
-- ============================================

SET @curso_2b_con201 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-CON201' LIMIT 1);
SET @curso_2b_coc202 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-COC202' LIMIT 1);
SET @curso_2b_cos203 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-COS203' LIMIT 1);
SET @curso_2b_cds204 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-CDS204' LIMIT 1);
SET @curso_2b_cbc205 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-CBC205' LIMIT 1);
SET @curso_2b_emp206 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-EMP206' LIMIT 1);
SET @curso_2b_sit207 = (SELECT id FROM cursos WHERE codigo = 'CON-2B-NOCHE-SIT207' LIMIT 1);

-- ============================================
-- SEGUNDO A - TARDE
-- ============================================

-- CONTABILIDAD II (4 horas/semana)
-- LUNES (2 bloques) + MARTES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_con201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_con201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_con201, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_con201, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD DE COSTOS I (4 horas/semana)
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_coc202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_coc202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_coc202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_coc202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD DE SEGUROS (2 horas/semana)
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_cos203, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_cos203, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- CONTABILIDAD DE SOCIEDADES (4 horas/semana)
-- LUNES (1 bloque) + JUEVES (2 bloques) + MIÉRCOLES (1 bloque)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_cds204, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_cds204, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- CONTABILIDAD BANCARIA Y COOPERATIVA (5 horas/semana)
-- VIERNES (5 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_cbc205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_cbc205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_cbc205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_cbc205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4),
(@curso_2a_cbc205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 5);

-- EMPRENDIMIENTO PRODUCTIVO (4 horas/semana)
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_emp206, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_emp206, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_emp206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_emp206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- SISTEMA TRIBUTARIO (4 horas/semana)
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_sit207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_sit207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_sit207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_sit207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ============================================
-- SEGUNDO B - NOCHE
-- ============================================

-- CONTABILIDAD II (5 horas/semana)
-- LUNES (1 bloque) + MARTES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_con201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_con201, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_con201, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_con201, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_con201, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- CONTABILIDAD DE COSTOS I (5 horas/semana)
-- VIERNES (1 bloque) + SÁBADO (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_coc202, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_coc202, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), NULL, 2),
(@curso_2b_coc202, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '17:30:00' LIMIT 1), NULL, 3),
(@curso_2b_coc202, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '18:15:00' LIMIT 1), NULL, 4),
(@curso_2b_coc202, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- CONTABILIDAD DE SEGUROS (2 horas/semana)
-- SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_cos203, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), NULL, 1),
(@curso_2b_cos203, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), NULL, 2);

-- CONTABILIDAD DE SOCIEDADES (5 horas/semana)
-- JUEVES (5 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_cds204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- CONTABILIDAD BANCARIA Y COOPERATIVA (5 horas/semana)
-- LUNES (5 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_cbc205, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_cbc205, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_cbc205, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_cbc205, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_cbc205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- EMPRENDIMIENTO PRODUCTIVO (5 horas/semana)
-- MIÉRCOLES (2 bloques) + VIERNES (3 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_emp206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_emp206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_emp206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_emp206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_emp206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- SISTEMA TRIBUTARIO (5 horas/semana)
-- MIÉRCOLES (2 bloques) + JUEVES (1 bloque) + MARTES (2 bloques adicionales)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_sit207, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_sit207, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_sit207, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_sit207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_sit207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 7 cursos × ~4 bloques = ~31 registros
-- PARALELO B (NOCHE): 7 cursos × ~5 bloques = ~35 registros
-- TOTAL: ~66 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
