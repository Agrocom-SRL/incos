-- ============================================
-- SEEDER: asignacion_horarios - SISTEMAS INFORMÁTICOS TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 1 (SIS-INF) → Periodo 3 → Paralelo 3A → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 23-30 (3A: 23-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-5=7 (Tercer año utiliza LAB-5)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- TERCERO A - NOCHE (asignacion_docente_id: 23-30)
-- ============================================

-- EMPRENDIMIENTO PRODUCTIVO (asignacion_docente_id = 23) - 4 horas/semana
-- MIÉRCOLES (4 bloques) LAB 5 - Periodos 1-2 y 4-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(91, 23, 41, 7, 1),   -- MIERCOLES 18:15 (horario_id=41) LAB-5 - Periodo 1
(92, 23, 42, 7, 2),   -- MIERCOLES 19:00 (horario_id=42) LAB-5 - Periodo 2
(93, 23, 44, 7, 3),   -- MIERCOLES 20:30 (horario_id=44) LAB-5 - Periodo 4
(94, 23, 45, 7, 4);   -- MIERCOLES 21:15 (horario_id=45) LAB-5 - Periodo 5

-- DISEÑO Y PROGRAMACIÓN WEB III (asignacion_docente_id = 24) - 4 horas/semana
-- LUNES (4 bloques) LAB 5 - Periodos 1-4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(95, 24, 31, 7, 1),   -- LUNES 18:15 (horario_id=31) LAB-5 - Periodo 1
(96, 24, 32, 7, 2),   -- LUNES 19:00 (horario_id=32) LAB-5 - Periodo 2
(97, 24, 33, 7, 3),   -- LUNES 19:45 (horario_id=33) LAB-5 - Periodo 3
(98, 24, 34, 7, 4);   -- LUNES 20:30 (horario_id=34) LAB-5 - Periodo 4

-- GESTIÓN Y MEJORAMIENTO DE CALIDAD DE SOFTWARE (asignacion_docente_id = 25) - 2 horas/semana
-- SÁBADO (2 bloques) LAB 5 - Periodos 4-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(99, 25, 59, 7, 1),   -- SABADO 17:30 (horario_id=59) LAB-5 - Periodo 4
(100, 25, 60, 7, 2);  -- SABADO 18:15 (horario_id=60) LAB-5 - Periodo 5

-- REDES DE COMPUTADORAS II (asignacion_docente_id = 26) - 4 horas/semana
-- VIERNES (3 bloques) + SÁBADO (1 bloque) LAB 5 - Periodos 3-5 (Viernes) y Periodo 3 (Sábado)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(101, 26, 53, 7, 1),  -- VIERNES 19:45 (horario_id=53) LAB-5 - Periodo 3
(102, 26, 54, 7, 2),  -- VIERNES 20:30 (horario_id=54) LAB-5 - Periodo 4
(103, 26, 55, 7, 3),  -- VIERNES 21:15 (horario_id=55) LAB-5 - Periodo 5
(104, 26, 58, 7, 4);  -- SABADO 16:30 (horario_id=58) LAB-5 - Periodo 3

-- TALLER DE MODALIDAD DE GRADUACIÓN (asignacion_docente_id = 27) - 4 horas/semana
-- JUEVES (3 bloques) + MIÉRCOLES (1 bloque) LAB 5 - Periodos 1-3 (Jueves) y Periodo 3 (Miércoles)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(105, 27, 46, 7, 1),  -- JUEVES 18:15 (horario_id=46) LAB-5 - Periodo 1
(106, 27, 47, 7, 2),  -- JUEVES 19:00 (horario_id=47) LAB-5 - Periodo 2
(107, 27, 48, 7, 3),  -- JUEVES 19:45 (horario_id=48) LAB-5 - Periodo 3
(108, 27, 43, 7, 4);  -- MIERCOLES 19:45 (horario_id=43) LAB-5 - Periodo 3

-- ANÁLISIS Y DISEÑO DE SISTEMAS II (asignacion_docente_id = 28) - 4 horas/semana
-- VIERNES (2 bloques) + MARTES (2 bloques) LAB 5 - Periodos 1-2 (Viernes) y Periodos 4-5 (Martes)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(109, 28, 51, 7, 1),  -- VIERNES 18:15 (horario_id=51) LAB-5 - Periodo 1
(110, 28, 52, 7, 2),  -- VIERNES 19:00 (horario_id=52) LAB-5 - Periodo 2
(111, 28, 39, 7, 3),  -- MARTES 20:30 (horario_id=39) LAB-5 - Periodo 4
(112, 28, 40, 7, 4);  -- MARTES 21:15 (horario_id=40) LAB-5 - Periodo 5

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II (asignacion_docente_id = 29) - 4 horas/semana
-- MARTES (3 bloques) + LUNES (1 bloque) LAB 5 - Periodos 1-3 (Martes) y Periodo 5 (Lunes)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(113, 29, 36, 7, 1),  -- MARTES 18:15 (horario_id=36) LAB-5 - Periodo 1
(114, 29, 37, 7, 2),  -- MARTES 19:00 (horario_id=37) LAB-5 - Periodo 2
(115, 29, 38, 7, 3),  -- MARTES 19:45 (horario_id=38) LAB-5 - Periodo 3
(116, 29, 35, 7, 4);  -- LUNES 21:15 (horario_id=35) LAB-5 - Periodo 5

-- BASE DE DATOS II (asignacion_docente_id = 30) - 4 horas/semana
-- JUEVES (2 bloques) + SÁBADO (2 bloques) LAB 5 - Periodos 4-5 (Jueves) y Periodos 1-2 (Sábado)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(117, 30, 49, 7, 1),  -- JUEVES 20:30 (horario_id=49) LAB-5 - Periodo 4
(118, 30, 50, 7, 2),  -- JUEVES 21:15 (horario_id=50) LAB-5 - Periodo 5
(119, 30, 56, 7, 3),  -- SABADO 15:00 (horario_id=56) LAB-5 - Periodo 1
(120, 30, 57, 7, 4);  -- SABADO 15:45 (horario_id=57) LAB-5 - Periodo 2

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TERCERO A - NOCHE): 8 cursos = 30 registros (IDs 91-120)
--   EMPRENDIMIENTO PRODUCTIVO: 4 registros (91-94) - MIERCOLES Periodos 1-2 y 4-5 Lab 5
--   DISEÑO Y PROGRAMACIÓN WEB III: 4 registros (95-98) - LUNES Periodos 1-4 Lab 5
--   GESTIÓN Y MEJORAMIENTO DE CALIDAD DE SOFTWARE: 2 registros (99-100) - SABADO Periodos 4-5 Lab 5
--   REDES DE COMPUTADORAS II: 4 registros (101-104) - VIERNES Periodos 3-5 + SABADO Periodo 3 Lab 5
--   TALLER DE MODALIDAD DE GRADUACIÓN: 4 registros (105-108) - JUEVES Periodos 1-3 + MIERCOLES Periodo 3 Lab 5
--   ANÁLISIS Y DISEÑO DE SISTEMAS II: 4 registros (109-112) - VIERNES Periodos 1-2 + MARTES Periodos 4-5 Lab 5
--   PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II: 4 registros (113-116) - MARTES Periodos 1-3 + LUNES Periodo 5 Lab 5
--   BASE DE DATOS II: 4 registros (117-120) - JUEVES Periodos 4-5 + SABADO Periodos 1-2 Lab 5
-- TOTAL: 30 registros (IDs 91-120)
-- Continuación desde el último ID del seeder de segundo año (90)
-- NOTA: Horarios corregidos según imagen oficial del horario académico 2026
-- Todos los cursos del tercer año se dictan en LAB-5 (aula_id=7)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
