-- ============================================
-- SEEDER: asignacion_horarios - ADMINISTRACIÓN SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 2 (ADM-EMP) → Periodo 2 → Paralelos → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 52-67 (2A: 52-59, 2B: 60-67)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Continuación desde último ID del seeder de Administración primer año: 210

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- SEGUNDO A - TARDE (asignacion_docente_id: 52-59)
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (asignacion_docente_id = 52) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(211, 52, 23, NULL, 1),   -- JUEVES 16:45 (horario_id=23)
(212, 52, 24, NULL, 2);   -- JUEVES 17:30 (horario_id=24)

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADO (asignacion_docente_id = 53) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(213, 53, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(214, 53, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(215, 53, 9, NULL, 3),    -- MARTES 15:15 (horario_id=9)
(216, 53, 10, NULL, 4);   -- MARTES 16:00 (horario_id=10)

-- ADMINISTRACIÓN DE OPERACIONES (asignacion_docente_id = 54) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(217, 54, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(218, 54, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(219, 54, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(220, 54, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- GESTIÓN DEL TALENTO HUMANO (asignacion_docente_id = 55) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(221, 55, 15, NULL, 1),   -- MIERCOLES 15:15 (horario_id=15)
(222, 55, 16, NULL, 2),   -- MIERCOLES 16:00 (horario_id=16)
(223, 55, 17, NULL, 3),   -- MIERCOLES 16:45 (horario_id=17)
(224, 55, 18, NULL, 4);   -- MIERCOLES 17:30 (horario_id=18)

-- ADMINISTRACIÓN FINANCIERA I (asignacion_docente_id = 56) - 4 horas/semana
-- LUNES (2 bloques) + MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(225, 56, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(226, 56, 6, NULL, 2),    -- LUNES 17:30 (horario_id=6)
(227, 56, 11, NULL, 3),   -- MARTES 16:45 (horario_id=11)
(228, 56, 12, NULL, 4);   -- MARTES 17:30 (horario_id=12)

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (asignacion_docente_id = 57) - 4 horas/semana
-- VIERNES (4 bloques) - Periodos 3-6
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(229, 57, 27, NULL, 1),   -- VIERNES 15:15 (horario_id=27)
(230, 57, 28, NULL, 2),   -- VIERNES 16:00 (horario_id=28)
(231, 57, 29, NULL, 3),   -- VIERNES 16:45 (horario_id=29)
(232, 57, 30, NULL, 4);   -- VIERNES 17:30 (horario_id=30)

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS (asignacion_docente_id = 58) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(233, 58, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(234, 58, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(235, 58, 19, NULL, 3),   -- JUEVES 13:45 (horario_id=19)
(236, 58, 20, NULL, 4);   -- JUEVES 14:30 (horario_id=20)

-- ECONOMÍA DE LA EMPRESA (asignacion_docente_id = 59) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(237, 59, 21, NULL, 1),   -- JUEVES 15:15 (horario_id=21)
(238, 59, 22, NULL, 2),   -- JUEVES 16:00 (horario_id=22)
(239, 59, 25, NULL, 3),   -- VIERNES 13:45 (horario_id=25)
(240, 59, 26, NULL, 4);   -- VIERNES 14:30 (horario_id=26)

-- ============================================
-- SEGUNDO B - NOCHE (asignacion_docente_id: 60-67)
-- ============================================

-- ORGANIZACIÓN DE LA ADMINISTRACIÓN (asignacion_docente_id = 60) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(241, 60, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(242, 60, 32, NULL, 2);   -- LUNES 19:00 (horario_id=32)

-- INVESTIGACIÓN Y ESTRATEGIA DE MERCADO (asignacion_docente_id = 61) - 4 horas/semana
-- VIERNES (3 bloques) + SÁBADO (1 bloque)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(243, 61, 53, NULL, 1),   -- VIERNES 19:45 (horario_id=53)
(244, 61, 54, NULL, 2),   -- VIERNES 20:30 (horario_id=54)
(245, 61, 55, NULL, 3),   -- VIERNES 21:15 (horario_id=55)
(246, 61, 56, NULL, 4);   -- SABADO 15:00 (horario_id=56)

-- ADMINISTRACIÓN DE OPERACIONES (asignacion_docente_id = 62) - 4 horas/semana
-- SÁBADO (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(247, 62, 57, NULL, 1),   -- SABADO 15:45 (horario_id=57)
(248, 62, 58, NULL, 2),   -- SABADO 16:30 (horario_id=58)
(249, 62, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(250, 62, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- GESTIÓN DEL TALENTO HUMANO (asignacion_docente_id = 63) - 4 horas/semana
-- JUEVES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(251, 63, 47, NULL, 1),   -- JUEVES 19:00 (horario_id=47)
(252, 63, 48, NULL, 2),   -- JUEVES 19:45 (horario_id=48)
(253, 63, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49)
(254, 63, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50)

-- ADMINISTRACIÓN FINANCIERA I (asignacion_docente_id = 64) - 4 horas/semana
-- MARTES (2 bloques) + VIERNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(255, 64, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(256, 64, 37, NULL, 2),   -- MARTES 19:00 (horario_id=37)
(257, 64, 51, NULL, 3),   -- VIERNES 18:15 (horario_id=51)
(258, 64, 52, NULL, 4);   -- VIERNES 19:00 (horario_id=52)

-- PREPARACIÓN Y EVALUACIÓN DE PROYECTOS (asignacion_docente_id = 65) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(259, 65, 42, NULL, 1),   -- MIERCOLES 19:00 (horario_id=42)
(260, 65, 43, NULL, 2),   -- MIERCOLES 19:45 (horario_id=43)
(261, 65, 44, NULL, 3),   -- MIERCOLES 20:30 (horario_id=44)
(262, 65, 45, NULL, 4);   -- MIERCOLES 21:15 (horario_id=45)

-- ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS (asignacion_docente_id = 66) - 4 horas/semana
-- MARTES (3 bloques) + JUEVES (1 bloque)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(263, 66, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(264, 66, 39, NULL, 2),   -- MARTES 20:30 (horario_id=39)
(265, 66, 40, NULL, 3),   -- MARTES 21:15 (horario_id=40)
(266, 66, 46, NULL, 4);   -- JUEVES 18:15 (horario_id=46)

-- ECONOMÍA DE LA EMPRESA (asignacion_docente_id = 67) - 5 horas/semana
-- LUNES (3 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(267, 67, 33, NULL, 1),   -- LUNES 19:45 (horario_id=33)
(268, 67, 34, NULL, 2),   -- LUNES 20:30 (horario_id=34)
(269, 67, 35, NULL, 3),   -- LUNES 21:15 (horario_id=35)
(270, 67, 41, NULL, 4);   -- MIERCOLES 18:15 (horario_id=41)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (SEGUNDO A - TARDE): 8 cursos = 30 registros (IDs 211-240)
--   ORGANIZACIÓN DE LA ADMINISTRACIÓN: 2 registros (211-212)
--   INVESTIGACIÓN Y ESTRATEGIA DE MERCADO: 4 registros (213-216)
--   ADMINISTRACIÓN DE OPERACIONES: 4 registros (217-220)
--   GESTIÓN DEL TALENTO HUMANO: 4 registros (221-224)
--   ADMINISTRACIÓN FINANCIERA I: 4 registros (225-228)
--   PREPARACIÓN Y EVALUACIÓN DE PROYECTOS: 4 registros (229-232)
--   ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS: 4 registros (233-236)
--   ECONOMÍA DE LA EMPRESA: 4 registros (237-240)
--
-- PARALELO B (SEGUNDO B - NOCHE): 8 cursos = 31 registros (IDs 241-271)
--   ORGANIZACIÓN DE LA ADMINISTRACIÓN: 2 registros (241-242)
--   INVESTIGACIÓN Y ESTRATEGIA DE MERCADO: 4 registros (243-246)
--   ADMINISTRACIÓN DE OPERACIONES: 4 registros (247-250)
--   GESTIÓN DEL TALENTO HUMANO: 4 registros (251-254)
--   ADMINISTRACIÓN FINANCIERA I: 4 registros (255-258)
--   PREPARACIÓN Y EVALUACIÓN DE PROYECTOS: 4 registros (259-262)
--   ADMINISTRACIÓN DE COSTOS Y PRESUPUESTOS: 4 registros (263-266)
--   ECONOMÍA DE LA EMPRESA: 5 registros (267-271)
--
-- TOTAL: 61 registros (IDs 211-271)
-- NOTA: Continuación desde el último ID del seeder de Administración primer año (210)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
