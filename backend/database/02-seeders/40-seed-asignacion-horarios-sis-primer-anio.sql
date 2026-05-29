-- ============================================
-- SEEDER: asignacion_horarios - SISTEMAS INFORMÁTICOS PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (NOCHE), PRIMERO B (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 1 (SIS-INF) → Periodo 1 → Paralelos → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 1-14 (1A: 1-7, 1B: 8-14)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-1=1, LAB-4=4, AULA-8=6

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- PRIMERO A - NOCHE (asignacion_docente_id: 1-7)
-- ============================================

-- PROGRAMACIÓN I (asignacion_docente_id = 2) - 8 horas/semana
-- MARTES (5 bloques) + JUEVES (1 bloque) + SÁBADO (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(1, 2, 36, 4, 1),   -- MARTES 18:15 (horario_id=36)
(2, 2, 37, 4, 2),   -- MARTES 19:00 (horario_id=37)
(3, 2, 38, 4, 3),   -- MARTES 19:45 (horario_id=38)
(4, 2, 39, 4, 4),   -- MARTES 20:30 (horario_id=39)
(5, 2, 40, 4, 5),   -- MARTES 21:15 (horario_id=40)
(6, 2, 48, 4, 6),   -- JUEVES 19:45 (horario_id=48)
(7, 2, 56, 4, 7),   -- SABADO 15:00 (horario_id=56)
(8, 2, 57, 4, 8);   -- SABADO 15:45 (horario_id=57)

-- MATEMÁTICA PARA LA INFORMÁTICA (asignacion_docente_id = 1) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(9, 1, 41, 4, 1),   -- MIERCOLES 18:15 (horario_id=41)
(10, 1, 42, 4, 2),  -- MIERCOLES 19:00 (horario_id=42)
(11, 1, 49, 4, 3),  -- JUEVES 20:30 (horario_id=49)
(12, 1, 50, 4, 4);  -- JUEVES 21:15 (horario_id=50)

-- INGLÉS TÉCNICO (asignacion_docente_id = 3) - 2 horas/semana
-- SÁBADO (2 bloques) - Periodos 4-5 según imagen oficial
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(13, 3, 59, NULL, 1),  -- SABADO 17:30 (horario_id=59) AULA - Periodo 4
(14, 3, 60, NULL, 2);  -- SABADO 18:15 (horario_id=60) AULA - Periodo 5

-- HARDWARE DE COMPUTADORAS (asignacion_docente_id = 4) - 4 horas/semana
-- VIERNES (4 bloques) AULA 8
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(15, 4, 51, 6, 1),  -- VIERNES 18:15 (horario_id=51)
(16, 4, 52, 6, 2),  -- VIERNES 19:00 (horario_id=52)
(17, 4, 53, 6, 3),  -- VIERNES 19:45 (horario_id=53)
(18, 4, 54, 6, 4);  -- VIERNES 20:30 (horario_id=54)

-- TALLER DE SISTEMAS OPERATIVOS (asignacion_docente_id = 5) - 4 horas/semana
-- LUNES (3 bloques) + VIERNES (1 bloque) LAB 4 y AULA 8
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(19, 5, 31, 4, 1),  -- LUNES 18:15 (horario_id=31) LAB-4
(20, 5, 32, 4, 2),  -- LUNES 19:00 (horario_id=32) LAB-4
(21, 5, 33, 4, 3),  -- LUNES 19:45 (horario_id=33) LAB-4
(22, 5, 55, 6, 4);  -- VIERNES 21:15 (horario_id=55) AULA-8

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (asignacion_docente_id = 6) - 4 horas/semana
-- JUEVES (2 bloques) + MIÉRCOLES (1 bloque) + SÁBADO (1 bloque) LAB 4 y LAB 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(23, 6, 46, 4, 1),  -- JUEVES 18:15 (horario_id=46) LAB-4 - Periodo 1
(24, 6, 47, 4, 2),  -- JUEVES 19:00 (horario_id=47) LAB-4 - Periodo 2
(25, 6, 43, 4, 3),  -- MIERCOLES 19:45 (horario_id=43) LAB-4 - Periodo 3
(26, 6, 58, 1, 4);  -- SABADO 16:30 (horario_id=58) LAB-1 - Periodo 3

-- DISEÑO Y PROGRAMACIÓN WEB I (asignacion_docente_id = 7) - 4 horas/semana
-- LUNES (2 bloques) + MIÉRCOLES (2 bloques) LAB 4 y LAB 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(27, 7, 34, 4, 1),  -- LUNES 20:30 (horario_id=34) LAB-4
(28, 7, 35, 4, 2),  -- LUNES 21:15 (horario_id=35) LAB-4
(29, 7, 44, 1, 3),  -- MIERCOLES 20:30 (horario_id=44) LAB-1
(30, 7, 45, 1, 4);  -- MIERCOLES 21:15 (horario_id=45) LAB-1

-- ============================================
-- PRIMERO B - NOCHE (asignacion_docente_id: 8-14)
-- ============================================

-- PROGRAMACIÓN I (asignacion_docente_id = 9) - 8 horas/semana según imagen oficial
-- LUNES (5 bloques completos: Periodo 1-2 Aula, Periodo 3-5 Lab 1) + VIERNES (3 bloques Lab 1)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(31, 9, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31) AULA - Periodo 1
(32, 9, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32) AULA - Periodo 2
(33, 9, 33, 1, 3),      -- LUNES 19:45 (horario_id=33) LAB-1 - Periodo 3
(34, 9, 34, 1, 4),      -- LUNES 20:30 (horario_id=34) LAB-1 - Periodo 4
(35, 9, 35, 1, 5),      -- LUNES 21:15 (horario_id=35) LAB-1 - Periodo 5
(36, 9, 51, 1, 6),      -- VIERNES 18:15 (horario_id=51) LAB-1 - Periodo 1
(37, 9, 52, 1, 7),      -- VIERNES 19:00 (horario_id=52) LAB-1 - Periodo 2
(38, 9, 53, 1, 8);      -- VIERNES 19:45 (horario_id=53) LAB-1 - Periodo 3

-- MATEMÁTICA PARA LA INFORMÁTICA (asignacion_docente_id = 8) - 4 horas/semana
-- JUEVES (2 bloques) + MIÉRCOLES (2 bloques) LAB 1, AULA y LAB 4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(39, 8, 46, 1, 1),   -- JUEVES 18:15 (horario_id=46) LAB-1 - Periodo 1
(40, 8, 47, NULL, 2), -- JUEVES 19:00 (horario_id=47) AULA - Periodo 2
(41, 8, 44, 4, 3),   -- MIERCOLES 20:30 (horario_id=44) LAB-4 - Periodo 4
(42, 8, 45, 4, 4);   -- MIERCOLES 21:15 (horario_id=45) LAB-4 - Periodo 5

-- INGLÉS TÉCNICO (asignacion_docente_id = 10) - 2 horas/semana
-- SÁBADO (2 bloques) - Periodos 1-2 según imagen
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(43, 10, 56, NULL, 1),  -- SABADO 15:00 (horario_id=56) AULA - Periodo 1
(44, 10, 57, NULL, 2);  -- SABADO 15:45 (horario_id=57) AULA - Periodo 2

-- HARDWARE DE COMPUTADORAS (asignacion_docente_id = 11) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques) AULA 8 y LAB 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(45, 11, 41, 6, 1),  -- MIERCOLES 18:15 (horario_id=41) AULA-8 - Periodo 1
(46, 11, 42, 6, 2),  -- MIERCOLES 19:00 (horario_id=42) AULA-8 - Periodo 2
(47, 11, 54, 1, 3),  -- VIERNES 20:30 (horario_id=54) LAB-1 - Periodo 4
(48, 11, 55, 1, 4);  -- VIERNES 21:15 (horario_id=55) LAB-1 - Periodo 5

-- TALLER DE SISTEMAS OPERATIVOS (asignacion_docente_id = 12) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (3 bloques) AULA y LAB 4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(49, 12, 48, NULL, 1),  -- JUEVES 19:45 (horario_id=48) AULA - Periodo 3
(50, 12, 58, 4, 2),     -- SABADO 16:30 (horario_id=58) LAB-4 - Periodo 3
(51, 12, 59, 4, 3),     -- SABADO 17:30 (horario_id=59) LAB-4 - Periodo 4
(52, 12, 60, 4, 4);     -- SABADO 18:15 (horario_id=60) LAB-4 - Periodo 5

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (asignacion_docente_id = 13) - 4 horas/semana
-- MARTES (3 bloques) + MIÉRCOLES (1 bloque) LAB 1 y AULA 8
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(53, 13, 36, 1, 1),  -- MARTES 18:15 (horario_id=36) LAB-1 - Periodo 1
(54, 13, 37, 1, 2),  -- MARTES 19:00 (horario_id=37) LAB-1 - Periodo 2
(55, 13, 38, 1, 3),  -- MARTES 19:45 (horario_id=38) LAB-1 - Periodo 3
(56, 13, 43, 6, 4);  -- MIERCOLES 19:45 (horario_id=43) AULA-8 - Periodo 3

-- DISEÑO Y PROGRAMACIÓN WEB I (asignacion_docente_id = 14) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques) LAB 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(57, 14, 39, 1, 1),  -- MARTES 20:30 (horario_id=39) LAB-1 - Periodo 4
(58, 14, 40, 1, 2),  -- MARTES 21:15 (horario_id=40) LAB-1 - Periodo 5
(59, 14, 49, 1, 3),  -- JUEVES 20:30 (horario_id=49) LAB-1 - Periodo 4
(60, 14, 50, 1, 4);  -- JUEVES 21:15 (horario_id=50) LAB-1 - Periodo 5

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 7 cursos = 30 registros (IDs 1-30)
--   PROGRAMACIÓN I: 8 registros (1-8)
--   MATEMÁTICA PARA LA INFORMÁTICA: 4 registros (9-12)
--   INGLÉS TÉCNICO: 2 registros (13-14)
--   HARDWARE DE COMPUTADORAS: 4 registros (15-18)
--   TALLER DE SISTEMAS OPERATIVOS: 4 registros (19-22)
--   OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA: 4 registros (23-26)
--   DISEÑO Y PROGRAMACIÓN WEB I: 4 registros (27-30)
--
-- PARALELO B (NOCHE): 7 cursos = 30 registros (IDs 31-60)
--   PROGRAMACIÓN I: 8 registros (31-38) - LUNES completo (5 bloques) + VIERNES (3 bloques)
--   MATEMÁTICA PARA LA INFORMÁTICA: 4 registros (39-42) - JUEVES (2 bloques) + MIÉRCOLES (2 bloques)
--   INGLÉS TÉCNICO: 2 registros (43-44) - SÁBADO Periodos 1-2
--   HARDWARE DE COMPUTADORAS: 4 registros (45-48) - MIÉRCOLES (2 bloques) + VIERNES (2 bloques)
--   TALLER DE SISTEMAS OPERATIVOS: 4 registros (49-52) - JUEVES (1 bloque) + SÁBADO (3 bloques)
--   OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA: 4 registros (53-56) - MARTES (3 bloques) + MIÉRCOLES (1 bloque)
--   DISEÑO Y PROGRAMACIÓN WEB I: 4 registros (57-60) - MARTES (2 bloques) + JUEVES (2 bloques)
--
-- TOTAL: 60 registros (IDs 1-60)
-- NOTA: Horarios corregidos según imagen oficial del horario académico 2026
-- PROGRAMACIÓN I en PRIMERO B ahora tiene 8 horas (coincide con el Plan de Estudios)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
