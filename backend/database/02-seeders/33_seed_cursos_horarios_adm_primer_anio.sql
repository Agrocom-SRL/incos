-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (NOCHE)
-- ============================================
-- Orden: Carrera 2 (ADM-EMP) → Periodo 1 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 31-44 (1A: 31-37, 1B: 38-44)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Aulas: LAB-1=1

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
(120, 31, 1, NULL, 1),   -- LUNES 13:45 (horario_id=1)
(121, 31, 2, NULL, 2),   -- LUNES 14:30 (horario_id=2)
(122, 31, 3, NULL, 3),   -- LUNES 15:15 (horario_id=3)
(123, 31, 4, NULL, 4),   -- LUNES 16:00 (horario_id=4)
(124, 31, 17, NULL, 5),  -- MIERCOLES 16:45 (horario_id=17)
(125, 31, 18, NULL, 6);  -- MIERCOLES 17:30 (horario_id=18)

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (curso_id = 32) - 6 horas/semana
-- MIÉRCOLES (4 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(126, 32, 13, NULL, 1),  -- MIERCOLES 13:45 (horario_id=13)
(127, 32, 14, NULL, 2),  -- MIERCOLES 14:30 (horario_id=14)
(128, 32, 15, NULL, 3),  -- MIERCOLES 15:15 (horario_id=15)
(129, 32, 16, NULL, 4),  -- MIERCOLES 16:00 (horario_id=16)
(130, 32, 19, NULL, 5),  -- JUEVES 13:45 (horario_id=19)
(131, 32, 20, NULL, 6);  -- JUEVES 14:30 (horario_id=20)

-- MATEMÁTICA FINANCIERA (curso_id = 33) - 4 horas/semana
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(132, 33, 27, NULL, 1),  -- VIERNES 15:15 (horario_id=27)
(133, 33, 28, NULL, 2),  -- VIERNES 16:00 (horario_id=28)
(134, 33, 29, NULL, 3),  -- VIERNES 16:45 (horario_id=29)
(135, 33, 30, NULL, 4);  -- VIERNES 17:30 (horario_id=30)

-- ESTADÍSTICA PARA LOS NEGOCIOS (curso_id = 34) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(136, 34, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(137, 34, 8, NULL, 2),   -- MARTES 14:30 (horario_id=8)
(138, 34, 9, NULL, 3),   -- MARTES 15:15 (horario_id=9)
(139, 34, 10, NULL, 4);  -- MARTES 16:00 (horario_id=10)

-- PRÁCTICA LABORAL Y TRIBUTARIA (curso_id = 35) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(140, 35, 11, NULL, 1),   -- MARTES 16:45 (horario_id=11)
(141, 35, 12, NULL, 2),   -- MARTES 17:30 (horario_id=12)
(142, 35, 23, NULL, 3),   -- JUEVES 16:45 (horario_id=23)
(143, 35, 24, NULL, 4);   -- JUEVES 17:30 (horario_id=24)

-- INFORMÁTICA EMPRESARIAL (curso_id = 36) - 2 horas/semana LAB 1
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(144, 36, 5, 1, 1),       -- LUNES 16:45 (horario_id=5)
(145, 36, 6, 1, 2);       -- LUNES 17:30 (horario_id=6)

-- INGLÉS TÉCNICO (curso_id = 37) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(146, 37, 21, NULL, 1),   -- JUEVES 15:15 (horario_id=21)
(147, 37, 22, NULL, 2),   -- JUEVES 16:00 (horario_id=22)
(148, 37, 25, NULL, 3),   -- VIERNES 13:45 (horario_id=25)
(149, 37, 26, NULL, 4);   -- VIERNES 14:30 (horario_id=26)

-- ============================================
-- PRIMERO B - NOCHE (curso_id: 38-44)
-- ============================================

-- FUNDAMENTOS DE LA ADMINISTRACIÓN (curso_id = 38) - 6 horas/semana
-- LUNES (4 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(150, 38, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(151, 38, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(152, 38, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(153, 38, 34, NULL, 4),   -- LUNES 20:30 (horario_id=34)
(154, 38, 44, NULL, 5),   -- MIERCOLES 20:30 (horario_id=44)
(155, 38, 45, NULL, 6);   -- MIERCOLES 21:15 (horario_id=45)

-- CONTABILIDAD GENERAL PARA ADMINISTRADORES (curso_id = 39) - 6 horas/semana
-- MIÉRCOLES (4 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(156, 39, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(157, 39, 42, NULL, 2),   -- MIERCOLES 19:00 (horario_id=42)
(158, 39, 43, NULL, 3),   -- MIERCOLES 19:45 (horario_id=43)
(159, 39, 44, NULL, 4),   -- MIERCOLES 20:30 (horario_id=44)
(160, 39, 46, NULL, 5),   -- JUEVES 18:15 (horario_id=46)
(161, 39, 47, NULL, 6);   -- JUEVES 19:00 (horario_id=47)

-- MATEMÁTICA FINANCIERA (curso_id = 40) - 4 horas/semana
-- VIERNES (4 bloques) - Nota: El último horario 22:00 no existe, usar hasta 21:15
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(162, 40, 53, NULL, 1),   -- VIERNES 19:45 (horario_id=53)
(163, 40, 54, NULL, 2),   -- VIERNES 20:30 (horario_id=54)
(164, 40, 55, NULL, 3),   -- VIERNES 21:15 (horario_id=55)
(165, 40, 51, NULL, 4);   -- VIERNES 18:15 (horario_id=51) - Ajuste: usar horario disponible

-- ESTADÍSTICA PARA LOS NEGOCIOS (curso_id = 41) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(166, 41, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(167, 41, 37, NULL, 2),   -- MARTES 19:00 (horario_id=37)
(168, 41, 38, NULL, 3),   -- MARTES 19:45 (horario_id=38)
(169, 41, 39, NULL, 4);   -- MARTES 20:30 (horario_id=39)

-- PRÁCTICA LABORAL Y TRIBUTARIA (curso_id = 42) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(170, 42, 39, NULL, 1),   -- MARTES 20:30 (horario_id=39)
(171, 42, 40, NULL, 2),   -- MARTES 21:15 (horario_id=40)
(172, 42, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49)
(173, 42, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50)

-- INFORMÁTICA EMPRESARIAL (curso_id = 43) - 2 horas/semana LAB 1
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(174, 43, 34, 1, 1),      -- LUNES 20:30 (horario_id=34)
(175, 43, 35, 1, 2);      -- LUNES 21:15 (horario_id=35)

-- INGLÉS TÉCNICO (curso_id = 44) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(176, 44, 48, NULL, 1),   -- JUEVES 19:45 (horario_id=48)
(177, 44, 49, NULL, 2),   -- JUEVES 20:30 (horario_id=49)
(178, 44, 51, NULL, 3),   -- VIERNES 18:15 (horario_id=51)
(179, 44, 52, NULL, 4);   -- VIERNES 19:00 (horario_id=52)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 7 cursos × ~4-6 bloques = 30 registros (IDs 120-149)
-- PARALELO B (NOCHE): 7 cursos × ~4-6 bloques = 30 registros (IDs 150-179)
-- TOTAL: 60 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
