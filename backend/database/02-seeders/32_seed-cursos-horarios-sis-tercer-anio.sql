-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================
-- Orden: Carrera 1 (SIS-INF) → Periodo 3 → Paralelo 3A → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 23-30 (3A: 23-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-3=3 (Nota: LAB-5 no existe, se usa LAB-3 como alternativa)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- TERCERO A - NOCHE (curso_id: 23-30)
-- ============================================

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 23) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(90, 23, 41, 3, 1),   -- MIERCOLES 18:15 (horario_id=41) LAB-3
(91, 23, 42, 3, 2),   -- MIERCOLES 19:00 (horario_id=42) LAB-3
(92, 23, 44, 3, 3),   -- MIERCOLES 20:30 (horario_id=44) LAB-3
(93, 23, 45, 3, 4);   -- MIERCOLES 21:15 (horario_id=45) LAB-3

-- DISEÑO Y PROGRAMACIÓN WEB III (curso_id = 24) - 4 horas/semana
-- LUNES (4 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(94, 24, 31, 3, 1),   -- LUNES 18:15 (horario_id=31) LAB-3
(95, 24, 32, 3, 2),   -- LUNES 19:00 (horario_id=32) LAB-3
(96, 24, 33, 3, 3),   -- LUNES 19:45 (horario_id=33) LAB-3
(97, 24, 34, 3, 4);   -- LUNES 20:30 (horario_id=34) LAB-3

-- GESTIÓN Y MEJORAMIENTO DE CALIDAD DE SOFTWARE (curso_id = 25) - 2 horas/semana
-- SÁBADO (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(98, 25, 59, 3, 1),   -- SABADO 17:30 (horario_id=59) LAB-3
(99, 25, 60, 3, 2);   -- SABADO 18:15 (horario_id=60) LAB-3

-- REDES DE COMPUTADORAS II (curso_id = 26) - 4 horas/semana
-- VIERNES (3 bloques) + SÁBADO (1 bloque) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(100, 26, 53, 3, 1),  -- VIERNES 19:45 (horario_id=53) LAB-3
(101, 26, 54, 3, 2),  -- VIERNES 20:30 (horario_id=54) LAB-3
(102, 26, 55, 3, 3),  -- VIERNES 21:15 (horario_id=55) LAB-3
(103, 26, 58, 3, 4);  -- SABADO 16:30 (horario_id=58) LAB-3

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 27) - 4 horas/semana
-- JUEVES (2 bloques) + MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(104, 27, 46, 3, 1),  -- JUEVES 18:15 (horario_id=46) LAB-3
(105, 27, 47, 3, 2),  -- JUEVES 19:00 (horario_id=47) LAB-3
(106, 27, 43, 3, 3),  -- MIERCOLES 19:45 (horario_id=43) LAB-3
(107, 27, 44, 3, 4);  -- MIERCOLES 20:30 (horario_id=44) LAB-3

-- ANÁLISIS Y DISEÑO DE SISTEMAS II (curso_id = 28) - 4 horas/semana
-- VIERNES (2 bloques) + MARTES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(108, 28, 51, 3, 1),  -- VIERNES 18:15 (horario_id=51) LAB-3
(109, 28, 52, 3, 2),  -- VIERNES 19:00 (horario_id=52) LAB-3
(110, 28, 39, 3, 3),  -- MARTES 20:30 (horario_id=39) LAB-3
(111, 28, 40, 3, 4);  -- MARTES 21:15 (horario_id=40) LAB-3

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II (curso_id = 29) - 4 horas/semana
-- MARTES (2 bloques) + LUNES (1 bloque) + SÁBADO (1 bloque) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(112, 29, 36, 3, 1),  -- MARTES 18:15 (horario_id=36) LAB-3
(113, 29, 37, 3, 2),  -- MARTES 19:00 (horario_id=37) LAB-3
(114, 29, 35, 3, 3),  -- LUNES 21:15 (horario_id=35) LAB-3
(115, 29, 57, 3, 4);  -- SABADO 15:45 (horario_id=57) LAB-3

-- BASE DE DATOS II (curso_id = 30) - 4 horas/semana
-- JUEVES (2 bloques) + SÁBADO (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(116, 30, 49, 3, 1),  -- JUEVES 20:30 (horario_id=49) LAB-3
(117, 30, 50, 3, 2),  -- JUEVES 21:15 (horario_id=50) LAB-3
(118, 30, 56, 3, 3),  -- SABADO 15:00 (horario_id=56) LAB-3
(119, 30, 57, 3, 4);  -- SABADO 15:45 (horario_id=57) LAB-3

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 8 cursos = 30 registros (IDs 90-119)
--   EMPRENDIMIENTO PRODUCTIVO: 4 registros (90-93)
--   DISEÑO Y PROGRAMACIÓN WEB III: 4 registros (94-97)
--   GESTIÓN Y MEJORAMIENTO DE CALIDAD DE SOFTWARE: 2 registros (98-99)
--   REDES DE COMPUTADORAS II: 4 registros (100-103)
--   TALLER DE MODALIDAD DE GRADUACIÓN: 4 registros (104-107)
--   ANÁLISIS Y DISEÑO DE SISTEMAS II: 4 registros (108-111)
--   PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II: 4 registros (112-115)
--   BASE DE DATOS II: 4 registros (116-119)
-- TOTAL: 30 registros
-- NOTA: LAB-5 no existe en el seeder de aulas, se usó LAB-3 (id=3) como alternativa
-- ============================================
-- FIN DEL SEEDER
-- ============================================
