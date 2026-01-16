-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: SEGUNDO A (NOCHE)
-- ============================================
-- Orden: Carrera 1 (SIS-INF) → Periodo 2 → Paralelo 2A → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 15-22 (2A: 15-22)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-3=3

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- SEGUNDO A - NOCHE (curso_id: 15-22)
-- ============================================

-- ESTADÍSTICA (curso_id = 15) - 2 horas/semana
-- LUNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(61, 15, 34, 3, 1),  -- LUNES 20:30 (horario_id=34)
(62, 15, 35, 3, 2);  -- LUNES 21:15 (horario_id=35)

-- PROGRAMACIÓN II (curso_id = 16) - 6 horas/semana según asignaturas_plan
-- MARTES (2 bloques) + MIÉRCOLES (2 bloques) + JUEVES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(63, 16, 36, 3, 1),  -- MARTES 18:15 (horario_id=36) LAB-3
(64, 16, 37, 3, 2),  -- MARTES 19:00 (horario_id=37) LAB-3
(65, 16, 41, 3, 3),  -- MIERCOLES 18:15 (horario_id=41) LAB-3
(66, 16, 42, 3, 4),  -- MIERCOLES 19:00 (horario_id=42) LAB-3
(67, 16, 48, 3, 5),  -- JUEVES 19:45 (horario_id=48) LAB-3
(68, 16, 49, 3, 6);  -- JUEVES 20:30 (horario_id=49) LAB-3

-- ESTRUCTURA DE DATOS (curso_id = 17) - 2 horas/semana
-- MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(69, 17, 44, 3, 1),  -- MIERCOLES 20:30 (horario_id=44) LAB-3
(70, 17, 45, 3, 2);  -- MIERCOLES 21:15 (horario_id=45) LAB-3

-- REDES DE COMPUTADORAS I (curso_id = 18) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(71, 18, 49, 3, 1),  -- JUEVES 20:30 (horario_id=49) LAB-3
(72, 18, 50, 3, 2),  -- JUEVES 21:15 (horario_id=50) LAB-3
(73, 18, 51, 3, 3),  -- VIERNES 18:15 (horario_id=51) LAB-3
(74, 18, 52, 3, 4);  -- VIERNES 19:00 (horario_id=52) LAB-3

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I (curso_id = 19) - 4 horas/semana
-- MARTES (2 bloques) + SÁBADO (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(75, 19, 39, 3, 1),  -- MARTES 20:30 (horario_id=39) LAB-3
(76, 19, 40, 3, 2),  -- MARTES 21:15 (horario_id=40) LAB-3
(77, 19, 56, 3, 3),  -- SABADO 15:00 (horario_id=56) LAB-3
(78, 19, 57, 3, 4);  -- SABADO 15:45 (horario_id=57) LAB-3

-- ANÁLISIS Y DISEÑO DE SISTEMAS I (curso_id = 20) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(79, 20, 48, 3, 1),  -- JUEVES 19:45 (horario_id=48) LAB-3
(80, 20, 49, 3, 2),  -- JUEVES 20:30 (horario_id=49) LAB-3
(81, 20, 53, 3, 3),  -- VIERNES 19:45 (horario_id=53) LAB-3
(82, 20, 54, 3, 4);  -- VIERNES 20:30 (horario_id=54) LAB-3

-- DISEÑO Y PROGRAMACIÓN WEB II (curso_id = 21) - 4 horas/semana
-- LUNES (3 bloques) + JUEVES (1 bloque) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(83, 21, 31, 3, 1),  -- LUNES 18:15 (horario_id=31) LAB-3
(84, 21, 32, 3, 2),  -- LUNES 19:00 (horario_id=32) LAB-3
(85, 21, 33, 3, 3),  -- LUNES 19:45 (horario_id=33) LAB-3
(86, 21, 47, 3, 4);  -- JUEVES 19:00 (horario_id=47) LAB-3

-- BASE DE DATOS I (curso_id = 22) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (3 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(87, 22, 46, 3, 1),  -- JUEVES 18:15 (horario_id=46) LAB-3
(88, 22, 58, 3, 2),  -- SABADO 16:30 (horario_id=58) LAB-3
(89, 22, 59, 3, 3),  -- SABADO 17:30 (horario_id=59) LAB-3
(90, 22, 60, 3, 4);  -- SABADO 18:15 (horario_id=60) LAB-3

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 8 cursos = 30 registros (IDs 61-90)
--   ESTADÍSTICA: 2 registros (61-62)
--   PROGRAMACIÓN II: 6 registros (63-68)
--   ESTRUCTURA DE DATOS: 2 registros (69-70)
--   REDES DE COMPUTADORAS I: 4 registros (71-74)
--   PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I: 4 registros (75-78)
--   ANÁLISIS Y DISEÑO DE SISTEMAS I: 4 registros (79-82)
--   DISEÑO Y PROGRAMACIÓN WEB II: 4 registros (83-86)
--   BASE DE DATOS I: 4 registros (87-90)
-- TOTAL: 30 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
