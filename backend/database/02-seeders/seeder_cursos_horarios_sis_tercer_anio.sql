-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - TERCERO A (NOCHE)
-- ============================================

SET @curso_3a_emp301 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-EMP301' LIMIT 1);
SET @curso_3a_dpw302 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-DPW302' LIMIT 1);
SET @curso_3a_gmc303 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-GMC303' LIMIT 1);
SET @curso_3a_rdc304 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-RDC304' LIMIT 1);
SET @curso_3a_tmg305 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-TMG305' LIMIT 1);
SET @curso_3a_ads306 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-ADS306' LIMIT 1);
SET @curso_3a_pdm307 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-PDM307' LIMIT 1);
SET @curso_3a_bdd308 = (SELECT id FROM cursos WHERE codigo = 'SIS-3A-NOCHE-BDD308' LIMIT 1);

-- ============================================
-- OBTENER IDs DE AULAS
-- ============================================

-- Nota: Según el Excel, Tercer Año usa LAB 5 que no existe en nuestro seeder de aulas
-- Usaremos LAB-3 como alternativa
SET @aula_lab5 = (SELECT id FROM aulas WHERE codigo = 'LAB-3' LIMIT 1);

-- ============================================
-- TERCERO A - NOCHE
-- ============================================

-- EMPRENDIMIENTO PRODUCTIVO (4 horas/semana)
-- MIÉRCOLES (3 bloques) + JUEVES (1 bloque) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_emp301, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_emp301, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_emp301, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 3),
(@curso_3a_emp301, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 4);

-- DISEÑO Y PROGRAMACIÓN WEB III (4 horas/semana)
-- LUNES (4 bloques) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_dpw302, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_dpw302, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_dpw302, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 3),
(@curso_3a_dpw302, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 4);

-- GESTIÓN Y MEJORAMIENTO DE CALIDAD DE SOFTWARE (2 horas/semana)
-- SÁBADO (2 bloques) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_gmc303, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '17:30:00' LIMIT 1), @aula_lab5, 1),
(@curso_3a_gmc303, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '18:15:00' LIMIT 1), @aula_lab5, 2);

-- REDES DE COMPUTADORAS II (4 horas/semana)
-- VIERNES (2 bloques) + SÁBADO (2 bloques - pero ya usamos, ajustar)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_rdc304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_rdc304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_rdc304, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 3),
(@curso_3a_rdc304, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), @aula_lab5, 4);

-- TALLER DE MODALIDAD DE GRADUACIÓN (4 horas/semana)
-- JUEVES (2 bloques) + MIÉRCOLES (2 bloques) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_tmg305, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_tmg305, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_tmg305, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 3),
(@curso_3a_tmg305, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 4);

-- ANÁLISIS Y DISEÑO DE SISTEMAS II (4 horas/semana)
-- VIERNES (2 bloques) + MARTES (2 bloques) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_ads306, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_ads306, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_ads306, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 3),
(@curso_3a_ads306, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 4);

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II (4 horas/semana)
-- MARTES (2 bloques) + LUNES (2 bloques) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_pdm307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_pdm307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_pdm307, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 3),
(@curso_3a_pdm307, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 4);

-- BASE DE DATOS II (4 horas/semana)
-- JUEVES (2 bloques) + SÁBADO (2 bloques) LAB 5
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_3a_bdd308, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 1),
(@curso_3a_bdd308, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab5, 2),
(@curso_3a_bdd308, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), @aula_lab5, 3),
(@curso_3a_bdd308, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), @aula_lab5, 4);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 8 cursos × ~4 bloques = ~32 registros
-- TOTAL: ~32 registros
-- NOTA: LAB 5 no existe en el seeder de aulas, se usó LAB 3 como alternativa
-- ============================================
-- FIN DEL SEEDER
-- ============================================
