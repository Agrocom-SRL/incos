-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================
-- Orden: Carrera 2 (ADM-EMP) → Periodo 2 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 45-60 (2A: 45-52, 2B: 53-60)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- SEGUNDO A - TARDE (curso_id: 45-52)
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (curso_id = 45) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(180, 45, 23, NULL, 1),   -- JUEVES 16:45 (horario_id=23)
(181, 45, 24, NULL, 2);   -- JUEVES 17:30 (horario_id=24)

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADOTECNIA (curso_id = 46) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(182, 46, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(183, 46, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(184, 46, 9, NULL, 3),    -- MARTES 15:15 (horario_id=9)
(185, 46, 10, NULL, 4);   -- MARTES 16:00 (horario_id=10)

-- ADMINISTRACIÓN DE OPERACIONES (curso_id = 47) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(186, 47, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(187, 47, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(188, 47, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(189, 47, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- GESTIÓN DEL TALENTO HUMANO (curso_id = 48) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(190, 48, 15, NULL, 1),   -- MIERCOLES 15:15 (horario_id=15)
(191, 48, 16, NULL, 2),   -- MIERCOLES 16:00 (horario_id=16)
(192, 48, 17, NULL, 3),   -- MIERCOLES 16:45 (horario_id=17)
(193, 48, 18, NULL, 4);   -- MIERCOLES 17:30 (horario_id=18)

-- ADMINISTRACIÓN FINANCIERA I (curso_id = 49) - 4 horas/semana
-- LUNES (2 bloques) + MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(194, 49, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(195, 49, 6, NULL, 2),    -- LUNES 17:30 (horario_id=6)
(196, 49, 11, NULL, 3),   -- MARTES 16:45 (horario_id=11)
(197, 49, 12, NULL, 4);   -- MARTES 17:30 (horario_id=12)

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (curso_id = 50) - 6 horas/semana
-- VIERNES (6 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(198, 50, 27, NULL, 1),   -- VIERNES 15:15 (horario_id=27)
(199, 50, 28, NULL, 2),   -- VIERNES 16:00 (horario_id=28)
(200, 50, 29, NULL, 3),   -- VIERNES 16:45 (horario_id=29)
(201, 50, 30, NULL, 4),   -- VIERNES 17:30 (horario_id=30)
(202, 50, 25, NULL, 5),   -- VIERNES 13:45 (horario_id=25)
(203, 50, 26, NULL, 6);   -- VIERNES 14:30 (horario_id=26)

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTO (curso_id = 51) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(204, 51, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(205, 51, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(206, 51, 19, NULL, 3),   -- JUEVES 13:45 (horario_id=19)
(207, 51, 20, NULL, 4);   -- JUEVES 14:30 (horario_id=20)

-- ECONOMÍA DE LA EMPRESA (curso_id = 52) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(208, 52, 21, NULL, 1),   -- JUEVES 15:15 (horario_id=21)
(209, 52, 22, NULL, 2),   -- JUEVES 16:00 (horario_id=22)
(210, 52, 25, NULL, 3),   -- VIERNES 13:45 (horario_id=25)
(211, 52, 26, NULL, 4);   -- VIERNES 14:30 (horario_id=26)

-- ============================================
-- SEGUNDO B - NOCHE (curso_id: 53-60)
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (curso_id = 53) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(212, 53, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(213, 53, 32, NULL, 2);   -- LUNES 19:00 (horario_id=32)

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADOTECNIA (curso_id = 54) - 4 horas/semana
-- VIERNES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(214, 54, 53, NULL, 1),   -- VIERNES 19:45 (horario_id=53)
(215, 54, 54, NULL, 2),   -- VIERNES 20:30 (horario_id=54)
(216, 54, 56, NULL, 3),   -- SABADO 15:00 (horario_id=56)
(217, 54, 57, NULL, 4);   -- SABADO 15:45 (horario_id=57)

-- ADMINISTRACIÓN DE OPERACIONES (curso_id = 55) - 4 horas/semana
-- SÁBADO (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(218, 55, 57, NULL, 1),   -- SABADO 15:45 (horario_id=57)
(219, 55, 58, NULL, 2),   -- SABADO 16:30 (horario_id=58)
(220, 55, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(221, 55, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- GESTIÓN DEL TALENTO HUMANO (curso_id = 56) - 5 horas/semana
-- JUEVES (5 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(222, 56, 46, NULL, 1),   -- JUEVES 18:15 (horario_id=46)
(223, 56, 47, NULL, 2),   -- JUEVES 19:00 (horario_id=47)
(224, 56, 48, NULL, 3),   -- JUEVES 19:45 (horario_id=48)
(225, 56, 49, NULL, 4),   -- JUEVES 20:30 (horario_id=49)
(226, 56, 50, NULL, 5);   -- JUEVES 21:15 (horario_id=50)

-- ADMINISTRACIÓN FINANCIERA I (curso_id = 57) - 4 horas/semana
-- MARTES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(227, 57, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(228, 57, 37, NULL, 2),   -- MARTES 19:00 (horario_id=37)
(229, 57, 51, NULL, 3),   -- VIERNES 18:15 (horario_id=51)
(230, 57, 52, NULL, 4);   -- VIERNES 19:00 (horario_id=52)

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (curso_id = 58) - 5 horas/semana
-- MIÉRCOLES (5 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(231, 58, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(232, 58, 42, NULL, 2),   -- MIERCOLES 19:00 (horario_id=42)
(233, 58, 43, NULL, 3),   -- MIERCOLES 19:45 (horario_id=43)
(234, 58, 44, NULL, 4),   -- MIERCOLES 20:30 (horario_id=44)
(235, 58, 45, NULL, 5);   -- MIERCOLES 21:15 (horario_id=45)

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTO (curso_id = 59) - 5 horas/semana
-- MARTES (3 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(236, 59, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(237, 59, 39, NULL, 2),   -- MARTES 20:30 (horario_id=39)
(238, 59, 40, NULL, 3),   -- MARTES 21:15 (horario_id=40)
(239, 59, 46, NULL, 4),   -- JUEVES 18:15 (horario_id=46)
(240, 59, 47, NULL, 5);   -- JUEVES 19:00 (horario_id=47)

-- ECONOMÍA DE LA EMPRESA (curso_id = 60) - 5 horas/semana
-- LUNES (3 bloques) + MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(241, 60, 33, NULL, 1),   -- LUNES 19:45 (horario_id=33)
(242, 60, 34, NULL, 2),   -- LUNES 20:30 (horario_id=34)
(243, 60, 35, NULL, 3),   -- LUNES 21:15 (horario_id=35)
(244, 60, 36, NULL, 4),   -- MARTES 18:15 (horario_id=36)
(245, 60, 37, NULL, 5);   -- MARTES 19:00 (horario_id=37)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 8 cursos × ~4 bloques = 32 registros (IDs 180-211)
-- PARALELO B (NOCHE): 8 cursos × ~4-5 bloques = 36 registros (IDs 212-245)
-- TOTAL: 68 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
