-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (NOCHE), PRIMERO C (NOCHE)
-- ============================================
-- Orden: Carrera 2 (ADM-EMP) → Periodo 1 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 31-51 (1A: 31-37, 1B: 38-44, 1C: 45-51)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-1=1
-- Continuación desde último ID del seeder de Sistemas tercer año: 120

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- PRIMERO A - TARDE (curso_id: 31-37)
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (curso_id = 31) - 6 horas/semana
-- LUNES (4 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(121, 31, 1, NULL, 1),   -- LUNES 13:45 (horario_id=1)
(122, 31, 2, NULL, 2),   -- LUNES 14:30 (horario_id=2)
(123, 31, 3, NULL, 3),   -- LUNES 15:15 (horario_id=3)
(124, 31, 4, NULL, 4),   -- LUNES 16:00 (horario_id=4)
(125, 31, 17, NULL, 5),  -- MIERCOLES 16:45 (horario_id=17)
(126, 31, 18, NULL, 6);  -- MIERCOLES 17:30 (horario_id=18)

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (curso_id = 32) - 6 horas/semana
-- MIÉRCOLES (4 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(127, 32, 13, NULL, 1),  -- MIERCOLES 13:45 (horario_id=13)
(128, 32, 14, NULL, 2),  -- MIERCOLES 14:30 (horario_id=14)
(129, 32, 15, NULL, 3),  -- MIERCOLES 15:15 (horario_id=15)
(130, 32, 16, NULL, 4),  -- MIERCOLES 16:00 (horario_id=16)
(131, 32, 19, NULL, 5),  -- JUEVES 13:45 (horario_id=19)
(132, 32, 20, NULL, 6);  -- JUEVES 14:30 (horario_id=20)

-- MATEMÁTICA FINANCIERA (curso_id = 33) - 4 horas/semana
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(133, 33, 27, NULL, 1),  -- VIERNES 15:15 (horario_id=27)
(134, 33, 28, NULL, 2),  -- VIERNES 16:00 (horario_id=28)
(135, 33, 29, NULL, 3),  -- VIERNES 16:45 (horario_id=29)
(136, 33, 30, NULL, 4);  -- VIERNES 17:30 (horario_id=30)

-- ESTADÍSTICA PARA LOS NEGOCIOS (curso_id = 34) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(137, 34, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(138, 34, 8, NULL, 2),   -- MARTES 14:30 (horario_id=8)
(139, 34, 9, NULL, 3),   -- MARTES 15:15 (horario_id=9)
(140, 34, 10, NULL, 4);  -- MARTES 16:00 (horario_id=10)

-- PRÁCTICA LABORAL Y TRIBUTARIA (curso_id = 35) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(141, 35, 11, NULL, 1),   -- MARTES 16:45 (horario_id=11)
(142, 35, 12, NULL, 2),   -- MARTES 17:30 (horario_id=12)
(143, 35, 23, NULL, 3),   -- JUEVES 16:45 (horario_id=23)
(144, 35, 24, NULL, 4);   -- JUEVES 17:30 (horario_id=24)

-- INFORMÁTICA EMPRESARIAL (curso_id = 36) - 2 horas/semana LAB 1
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(145, 36, 5, 1, 1),       -- LUNES 16:45 (horario_id=5)
(146, 36, 6, 1, 2);       -- LUNES 17:30 (horario_id=6)

-- INGLÉS TÉCNICO (curso_id = 37) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(147, 37, 21, NULL, 1),   -- JUEVES 15:15 (horario_id=21)
(148, 37, 22, NULL, 2),   -- JUEVES 16:00 (horario_id=22)
(149, 37, 25, NULL, 3),   -- VIERNES 13:45 (horario_id=25)
(150, 37, 26, NULL, 4);   -- VIERNES 14:30 (horario_id=26)

-- ============================================
-- PRIMERO B - NOCHE (curso_id: 38-44)
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (curso_id = 38) - 6 horas/semana
-- MARTES (3 bloques) + JUEVES (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(151, 38, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(152, 38, 39, NULL, 2),   -- MARTES 20:30 (horario_id=39)
(153, 38, 40, NULL, 3),   -- MARTES 21:15 (horario_id=40)
(154, 38, 46, NULL, 4),   -- JUEVES 18:15 (horario_id=46)
(155, 38, 47, NULL, 5),   -- JUEVES 19:00 (horario_id=47)
(156, 38, 48, NULL, 6);   -- JUEVES 19:45 (horario_id=48)

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (curso_id = 39) - 6 horas/semana
-- JUEVES (2 bloques) + VIERNES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(157, 39, 49, NULL, 1),   -- JUEVES 20:30 (horario_id=49)
(158, 39, 50, NULL, 2),   -- JUEVES 21:15 (horario_id=50)
(159, 39, 53, NULL, 3),   -- VIERNES 19:45 (horario_id=53)
(160, 39, 56, NULL, 4),   -- SABADO 15:00 (horario_id=56)
(161, 39, 57, NULL, 5),   -- SABADO 15:45 (horario_id=57)
(162, 39, 58, NULL, 6);   -- SABADO 16:30 (horario_id=58)

-- MATEMÁTICA FINANCIERA (curso_id = 40) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(163, 40, 42, NULL, 1),   -- MIERCOLES 19:00 (horario_id=42)
(164, 40, 43, NULL, 2),   -- MIERCOLES 19:45 (horario_id=43)
(165, 40, 44, NULL, 3),   -- MIERCOLES 20:30 (horario_id=44)
(166, 40, 45, NULL, 4);   -- MIERCOLES 21:15 (horario_id=45)

-- ESTADÍSTICA PARA LOS NEGOCIOS (curso_id = 41) - 4 horas/semana
-- VIERNES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(167, 41, 51, NULL, 1),   -- VIERNES 18:15 (horario_id=51)
(168, 41, 52, NULL, 2),   -- VIERNES 19:00 (horario_id=52)
(169, 41, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(170, 41, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- PRÁCTICA LABORAL Y TRIBUTARIA (curso_id = 42) - 4 horas/semana
-- LUNES (2 bloques) + MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(171, 42, 33, NULL, 1),   -- LUNES 19:45 (horario_id=33)
(172, 42, 34, NULL, 2),   -- LUNES 20:30 (horario_id=34)
(173, 42, 36, NULL, 3),   -- MARTES 18:15 (horario_id=36)
(174, 42, 37, NULL, 4);   -- MARTES 19:00 (horario_id=37)

-- INFORMÁTICA EMPRESARIAL (curso_id = 43) - 2 horas/semana LAB 1
-- VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(175, 43, 54, 1, 1),      -- VIERNES 20:30 (horario_id=54)
(176, 43, 55, 1, 2);      -- VIERNES 21:15 (horario_id=55)

-- INGLÉS TÉCNICO (curso_id = 44) - 4 horas/semana
-- LUNES (3 bloques) + MIÉRCOLES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(177, 44, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(178, 44, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(179, 44, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(180, 44, 41, NULL, 4);   -- MIERCOLES 18:15 (horario_id=41)

-- ============================================
-- PRIMERO C - NOCHE (curso_id: 45-51)
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (curso_id = 45) - 6 horas/semana
-- LUNES (2 bloques) + VIERNES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(181, 45, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(182, 45, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(183, 45, 51, NULL, 3),   -- VIERNES 18:15 (horario_id=51)
(184, 45, 52, NULL, 4),   -- VIERNES 19:00 (horario_id=52)
(185, 45, 59, NULL, 5),   -- SABADO 17:30 (horario_id=59)
(186, 45, 60, NULL, 6);   -- SABADO 18:15 (horario_id=60)

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (curso_id = 46) - 6 horas/semana
-- MARTES (3 bloques) + VIERNES (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(187, 46, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(188, 46, 39, NULL, 2),   -- MARTES 20:30 (horario_id=39)
(189, 46, 40, NULL, 3),   -- MARTES 21:15 (horario_id=40)
(190, 46, 53, NULL, 4),   -- VIERNES 19:45 (horario_id=53)
(191, 46, 54, NULL, 5),   -- VIERNES 20:30 (horario_id=54)
(192, 46, 55, NULL, 6);   -- VIERNES 21:15 (horario_id=55)

-- MATEMÁTICA FINANCIERA (curso_id = 47) - 4 horas/semana
-- LUNES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(193, 47, 33, NULL, 1),   -- LUNES 19:45 (horario_id=33)
(194, 47, 34, NULL, 2),   -- LUNES 20:30 (horario_id=34)
(195, 47, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49)
(196, 47, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50)

-- ESTADÍSTICA PARA LOS NEGOCIOS (curso_id = 48) - 4 horas/semana
-- MARTES (2 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(197, 48, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(198, 48, 37, NULL, 2),   -- MARTES 19:00 (horario_id=37)
(199, 48, 44, NULL, 3),   -- MIERCOLES 20:30 (horario_id=44)
(200, 48, 45, NULL, 4);   -- MIERCOLES 21:15 (horario_id=45)

-- PRÁCTICA LABORAL Y TRIBUTARIA (curso_id = 49) - 4 horas/semana
-- LUNES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(201, 49, 35, NULL, 1),   -- LUNES 21:15 (horario_id=35)
(202, 49, 56, NULL, 2),   -- SABADO 15:00 (horario_id=56)
(203, 49, 57, NULL, 3),   -- SABADO 15:45 (horario_id=57)
(204, 49, 58, NULL, 4);   -- SABADO 16:30 (horario_id=58)

-- INFORMÁTICA EMPRESARIAL (curso_id = 50) - 2 horas/semana LAB 1
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(205, 50, 42, 1, 1),      -- MIERCOLES 19:00 (horario_id=42) LAB-1
(206, 50, 43, 1, 2);      -- MIERCOLES 19:45 (horario_id=43) LAB-1

-- INGLÉS TÉCNICO (curso_id = 51) - 4 horas/semana
-- MIÉRCOLES (1 bloque LAB) + JUEVES (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(207, 51, 41, 1, 1),      -- MIERCOLES 18:15 (horario_id=41) LAB-1
(208, 51, 46, NULL, 2),   -- JUEVES 18:15 (horario_id=46)
(209, 51, 47, NULL, 3),   -- JUEVES 19:00 (horario_id=47)
(210, 51, 48, NULL, 4);   -- JUEVES 19:45 (horario_id=48)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 7 cursos = 30 registros (IDs 121-150)
--   FUNDAMENTOS DE LA ADMINISTRACIÓN: 6 registros (121-126)
--   CONTABILIDAD GENERAL PARA ADMINISTRADORES: 6 registros (127-132)
--   MATEMÁTICA FINANCIERA: 4 registros (133-136)
--   ESTADÍSTICA PARA LOS NEGOCIOS: 4 registros (137-140)
--   PRÁCTICA LABORAL Y TRIBUTARIA: 4 registros (141-144)
--   INFORMÁTICA EMPRESARIAL: 2 registros (145-146)
--   INGLÉS TÉCNICO: 4 registros (147-150)
--
-- PARALELO B (NOCHE): 7 cursos = 30 registros (IDs 151-180)
--   FUNDAMENTOS DE LA ADMINISTRACIÓN: 6 registros (151-156)
--   CONTABILIDAD GENERAL PARA ADMINISTRADORES: 6 registros (157-162)
--   MATEMÁTICA FINANCIERA: 4 registros (163-166)
--   ESTADÍSTICA PARA LOS NEGOCIOS: 4 registros (167-170)
--   PRÁCTICA LABORAL Y TRIBUTARIA: 4 registros (171-174)
--   INFORMÁTICA EMPRESARIAL: 2 registros (175-176)
--   INGLÉS TÉCNICO: 4 registros (177-180)
--
-- PARALELO C (NOCHE): 7 cursos = 30 registros (IDs 181-210)
--   FUNDAMENTOS DE LA ADMINISTRACIÓN: 6 registros (181-186)
--   CONTABILIDAD GENERAL PARA ADMINISTRADORES: 6 registros (187-192)
--   MATEMÁTICA FINANCIERA: 4 registros (193-196)
--   ESTADÍSTICA PARA LOS NEGOCIOS: 4 registros (197-200)
--   PRÁCTICA LABORAL Y TRIBUTARIA: 4 registros (201-204)
--   INFORMÁTICA EMPRESARIAL: 2 registros (205-206)
--   INGLÉS TÉCNICO: 4 registros (207-210)
--
-- TOTAL: 90 registros (IDs 121-210)
-- NOTA: Continuación desde el último ID del seeder de Sistemas tercer año (120)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
