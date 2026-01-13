-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: SEGUNDO A (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - SEGUNDO A (NOCHE)
-- ============================================

SET @curso_2a_est201 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-EST201' LIMIT 1);
SET @curso_2a_prg202 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-PRG202' LIMIT 1);
SET @curso_2a_edd203 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-EDD203' LIMIT 1);
SET @curso_2a_rdc204 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-RDC204' LIMIT 1);
SET @curso_2a_pdm205 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-PDM205' LIMIT 1);
SET @curso_2a_ads206 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-ADS206' LIMIT 1);
SET @curso_2a_dpw207 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-DPW207' LIMIT 1);
SET @curso_2a_bdd208 = (SELECT id FROM cursos WHERE codigo = 'SIS-2A-NOCHE-BDD208' LIMIT 1);

-- ============================================
-- OBTENER IDs DE AULAS
-- ============================================

SET @aula_lab3 = (SELECT id FROM aulas WHERE codigo = 'LAB-3' LIMIT 1);

-- ============================================
-- SEGUNDO A - NOCHE
-- ============================================

-- ESTADÍSTICA (2 horas/semana)
-- LUNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_est201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_est201, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2);

-- PROGRAMACIÓN II (4 horas/semana)
-- MARTES (2 bloques) + MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_prg202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_prg202, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2),
(@curso_2a_prg202, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 3),
(@curso_2a_prg202, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 4);

-- ESTRUCTURA DE DATOS (2 horas/semana)
-- MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_edd203, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_edd203, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2);

-- REDES DE COMPUTADORAS I (4 horas/semana)
-- JUEVES (2 bloques) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_rdc204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_rdc204, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2),
(@curso_2a_rdc204, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 3),
(@curso_2a_rdc204, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 4);

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I (4 horas/semana)
-- MARTES (2 bloques) + SÁBADO (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_pdm205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_pdm205, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2),
(@curso_2a_pdm205, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), @aula_lab3, 3),
(@curso_2a_pdm205, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), @aula_lab3, 4);

-- ANÁLISIS Y DISEÑO DE SISTEMAS I (5 horas/semana)
-- MIÉRCOLES (1 bloque) + JUEVES (2 bloques) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_ads206, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_ads206, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2),
(@curso_2a_ads206, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 3),
(@curso_2a_ads206, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 4),
(@curso_2a_ads206, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 5);

-- DISEÑO Y PROGRAMACIÓN WEB II (4 horas/semana)
-- LUNES (3 bloques) + JUEVES (1 bloque) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_dpw207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_dpw207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 2),
(@curso_2a_dpw207, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 3),
(@curso_2a_dpw207, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 4);

-- BASE DE DATOS I (4 horas/semana)
-- JUEVES (1 bloque) + SÁBADO (1 bloque) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_2a_bdd208, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 1),
(@curso_2a_bdd208, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), @aula_lab3, 2),
(@curso_2a_bdd208, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 3),
(@curso_2a_bdd208, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab3, 4);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 8 cursos × ~4 bloques = ~33 registros
-- TOTAL: ~33 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
