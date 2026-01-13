-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - SEGUNDO A (TARDE)
-- ============================================

SET @curso_2a_ora201 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-ORA201' LIMIT 1);
SET @curso_2a_iem202 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-IEM202' LIMIT 1);
SET @curso_2a_ado203 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-ADO203' LIMIT 1);
SET @curso_2a_gth204 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-GTH204' LIMIT 1);
SET @curso_2a_adf205 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-ADF205' LIMIT 1);
SET @curso_2a_pep206 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-PEP206' LIMIT 1);
SET @curso_2a_acp207 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-ACP207' LIMIT 1);
SET @curso_2a_emp208 = (SELECT id FROM cursos WHERE codigo = 'ADM-2A-TARDE-EMP208' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - SEGUNDO B (NOCHE)
-- ============================================

SET @curso_2b_ora201 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-ORA201' LIMIT 1);
SET @curso_2b_iem202 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-IEM202' LIMIT 1);
SET @curso_2b_ado203 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-ADO203' LIMIT 1);
SET @curso_2b_gth204 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-GTH204' LIMIT 1);
SET @curso_2b_adf205 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-ADF205' LIMIT 1);
SET @curso_2b_pep206 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-PEP206' LIMIT 1);
SET @curso_2b_acp207 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-ACP207' LIMIT 1);
SET @curso_2b_emp208 = (SELECT id FROM cursos WHERE codigo = 'ADM-2B-NOCHE-EMP208' LIMIT 1);

-- ============================================
-- SEGUNDO A - TARDE
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (2 horas/semana)
-- JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_ora201, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_ora201, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2);

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADOTECNIA (4 horas/semana)
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_iem202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_iem202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_iem202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_iem202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ADMINISTRACIÓN DE OPERACIONES (4 horas/semana)
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_ado203, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_ado203, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_ado203, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_ado203, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- GESTIÓN DEL TALENTO HUMANO (4 horas/semana)
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_gth204, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_gth204, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_gth204, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_gth204, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ADMINISTRACIÓN FINANCIERA I (4 horas/semana)
-- LUNES (2 bloques) + MARTES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_adf205, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_adf205, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_adf205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_adf205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (6 horas/semana)
-- VIERNES (6 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_pep206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_pep206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_pep206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '16:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_pep206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '17:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4),
(@curso_2a_pep206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 5),
(@curso_2a_pep206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 6);

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTO (4 horas/semana)
-- MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_acp207, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_acp207, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_acp207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_acp207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ECONOMÍA DE LA EMPRESA (4 horas/semana)
-- JUEVES (2 bloques) + VIERNES (2 bloques iniciales - ya usados arriba, usar sábado o ajustar)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_emp208, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '15:15:00' AND turno = 'TARDE' LIMIT 1), NULL, 1),
(@curso_2a_emp208, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '16:00:00' AND turno = 'TARDE' LIMIT 1), NULL, 2),
(@curso_2a_emp208, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '13:45:00' AND turno = 'TARDE' LIMIT 1), NULL, 3),
(@curso_2a_emp208, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '14:30:00' AND turno = 'TARDE' LIMIT 1), NULL, 4);

-- ============================================
-- SEGUNDO B - NOCHE
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (2 horas/semana)
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_ora201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_ora201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2);

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADOTECNIA (4 horas/semana)
-- VIERNES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_iem202, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_iem202, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_iem202, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), NULL, 3),
(@curso_2b_iem202, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), NULL, 4);

-- ADMINISTRACIÓN DE OPERACIONES (4 horas/semana)
-- SÁBADO (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_ado203, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), NULL, 1),
(@curso_2b_ado203, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), NULL, 2),
(@curso_2b_ado203, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '17:30:00' LIMIT 1), NULL, 3),
(@curso_2b_ado203, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '18:15:00' LIMIT 1), NULL, 4);

-- GESTIÓN DEL TALENTO HUMANO (5 horas/semana)
-- JUEVES (5 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_gth204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_gth204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_gth204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_gth204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_gth204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- ADMINISTRACIÓN FINANCIERA I (4 horas/semana)
-- MARTES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_adf205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_adf205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_adf205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_adf205, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (5 horas/semana)
-- MIÉRCOLES (5 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_pep206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_pep206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_pep206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_pep206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_pep206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTO (5 horas/semana)
-- MARTES (5 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_acp207, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_acp207, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_acp207, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_acp207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_acp207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- ECONOMÍA DE LA EMPRESA (5 horas/semana)
-- LUNES (3 bloques) + MARTES (2 bloques iniciales)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2b_emp208, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_2b_emp208, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_2b_emp208, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_2b_emp208, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_2b_emp208, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 8 cursos × ~4 bloques = ~32 registros
-- PARALELO B (NOCHE): 8 cursos × ~4 bloques = ~36 registros
-- TOTAL: ~68 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
