-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - TERCERO A (NOCHE)
-- ============================================

SET @curso_3a_amp301 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-AMP301' LIMIT 1);
SET @curso_3a_imn302 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-IMN302' LIMIT 1);
SET @curso_3a_adf303 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-ADF303' LIMIT 1);
SET @curso_3a_tmg304 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-TMG304' LIMIT 1);
SET @curso_3a_emp305 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-EMP305' LIMIT 1);
SET @curso_3a_cmi306 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-CMI306' LIMIT 1);
SET @curso_3a_gee307 = (SELECT id FROM cursos WHERE codigo = 'ADM-3A-NOCHE-GEE307' LIMIT 1);

-- ============================================
-- TERCERO A - NOCHE
-- ============================================

-- ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA (6 horas/semana)
-- LUNES (5 bloques) + MIÉRCOLES (1 bloque)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_amp301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_amp301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_3a_amp301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_3a_amp301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4),
(@curso_3a_amp301, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 5),
(@curso_3a_amp301, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 6);

-- INCUBACIÓN Y MODELOS DE NEGOCIOS (4 horas/semana)
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_imn302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_imn302, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_3a_imn302, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_3a_imn302, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- ADMINISTRACIÓN FINANCIERA II (4 horas/semana)
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_adf303, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_adf303, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_3a_adf303, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_3a_adf303, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- TALLER DE MODALIDAD DE GRADUACIÓN (4 horas/semana)
-- JUEVES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_tmg304, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_tmg304, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), NULL, 2),
(@curso_3a_tmg304, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '17:30:00' LIMIT 1), NULL, 3),
(@curso_3a_tmg304, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '18:15:00' LIMIT 1), NULL, 4);

-- EMPRENDIMIENTO PRODUCTIVO (4 horas/semana)
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_emp305, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_emp305, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_3a_emp305, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_3a_emp305, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- COMERCIO INTERNACIONAL (4 horas/semana)
-- MARTES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_cmi306, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_cmi306, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_3a_cmi306, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), NULL, 3),
(@curso_3a_cmi306, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), NULL, 4);

-- GESTIÓN ESTRATÉGICA (5 horas/semana)
-- MARTES (1 bloque) + VIERNES (3 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_gee307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_3a_gee307, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_3a_gee307, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 3),
(@curso_3a_gee307, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 4);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 7 cursos × ~4-6 bloques = ~31 registros
-- TOTAL: ~31 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
