-- ============================================
-- SEEDER: asignacion_horarios - SISTEMAS INFORMÁTICOS SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: SEGUNDO A (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 1 (SIS-INF) → Periodo 2 → Paralelo 2A → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 15-22 (2A: 15-22)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-3=3

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- SEGUNDO A - NOCHE (asignacion_docente_id: 15-22)
-- ============================================

-- ESTADÍSTICA (asignacion_docente_id = 15) - 2 horas/semana
-- LUNES (2 bloques) LAB 3 - Periodos 4-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(61, 15, 34, 3, 1),  -- LUNES 20:30 (horario_id=34) LAB-3
(62, 15, 35, 3, 2);  -- LUNES 21:15 (horario_id=35) LAB-3

-- PROGRAMACIÓN II (asignacion_docente_id = 16) - 6 horas/semana según asignaturas_plan
-- MARTES (3 bloques) + MIÉRCOLES (3 bloques) LAB 3 - Periodos 1-3 ambos días
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(63, 16, 36, 3, 1),  -- MARTES 18:15 (horario_id=36) LAB-3 - Periodo 1
(64, 16, 37, 3, 2),  -- MARTES 19:00 (horario_id=37) LAB-3 - Periodo 2
(65, 16, 38, 3, 3),  -- MARTES 19:45 (horario_id=38) LAB-3 - Periodo 3
(66, 16, 41, 3, 4),  -- MIERCOLES 18:15 (horario_id=41) LAB-3 - Periodo 1
(67, 16, 42, 3, 5),  -- MIERCOLES 19:00 (horario_id=42) LAB-3 - Periodo 2
(68, 16, 43, 3, 6);  -- MIERCOLES 19:45 (horario_id=43) LAB-3 - Periodo 3

-- ESTRUCTURA DE DATOS (asignacion_docente_id = 17) - 2 horas/semana
-- MIÉRCOLES (2 bloques) LAB 3 - Periodos 4-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(69, 17, 44, 3, 1),  -- MIERCOLES 20:30 (horario_id=44) LAB-3 - Periodo 4
(70, 17, 45, 3, 2);  -- MIERCOLES 21:15 (horario_id=45) LAB-3 - Periodo 5

-- REDES DE COMPUTADORAS I (asignacion_docente_id = 18) - 4 horas/semana
-- VIERNES (2 bloques) + JUEVES (2 bloques) LAB 3 - Periodos 1-2 (Viernes) y Periodos 4-5 (Jueves)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(71, 18, 51, 3, 1),  -- VIERNES 18:15 (horario_id=51) LAB-3 - Periodo 1
(72, 18, 52, 3, 2),  -- VIERNES 19:00 (horario_id=52) LAB-3 - Periodo 2
(73, 18, 49, 3, 3),  -- JUEVES 20:30 (horario_id=49) LAB-3 - Periodo 4
(74, 18, 50, 3, 4);  -- JUEVES 21:15 (horario_id=50) LAB-3 - Periodo 5

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I (asignacion_docente_id = 19) - 4 horas/semana
-- MARTES (2 bloques) + SÁBADO (2 bloques) LAB 3 - Periodos 4-5 (Martes) y Periodos 1-2 (Sábado)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(75, 19, 39, 3, 1),  -- MARTES 20:30 (horario_id=39) LAB-3 - Periodo 4
(76, 19, 40, 3, 2),  -- MARTES 21:15 (horario_id=40) LAB-3 - Periodo 5
(77, 19, 56, 3, 3),  -- SABADO 15:00 (horario_id=56) LAB-3 - Periodo 1
(78, 19, 57, 3, 4);  -- SABADO 15:45 (horario_id=57) LAB-3 - Periodo 2

-- ANÁLISIS Y DISEÑO DE SISTEMAS I (asignacion_docente_id = 20) - 4 horas/semana
-- JUEVES (1 bloque) + VIERNES (3 bloques) LAB 3 - Periodo 3 (Jueves) y Periodos 3-5 (Viernes)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(79, 20, 48, 3, 1),  -- JUEVES 19:45 (horario_id=48) LAB-3 - Periodo 3
(80, 20, 53, 3, 2),  -- VIERNES 19:45 (horario_id=53) LAB-3 - Periodo 3
(81, 20, 54, 3, 3),  -- VIERNES 20:30 (horario_id=54) LAB-3 - Periodo 4
(82, 20, 55, 3, 4);  -- VIERNES 21:15 (horario_id=55) LAB-3 - Periodo 5

-- DISEÑO Y PROGRAMACIÓN WEB II (asignacion_docente_id = 21) - 4 horas/semana
-- LUNES (3 bloques) + JUEVES (1 bloque) LAB 3 - Periodos 1-3 (Lunes) y Periodo 2 (Jueves)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(83, 21, 31, 3, 1),  -- LUNES 18:15 (horario_id=31) LAB-3
(84, 21, 32, 3, 2),  -- LUNES 19:00 (horario_id=32) LAB-3
(85, 21, 33, 3, 3),  -- LUNES 19:45 (horario_id=33) LAB-3
(86, 21, 47, 3, 4);  -- JUEVES 19:00 (horario_id=47) LAB-3

-- BASE DE DATOS I (asignacion_docente_id = 22) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (3 bloques) LAB 3 - Periodo 1 (Jueves) y Periodos 3-5 (Sábado)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(87, 22, 46, 3, 1),  -- JUEVES 18:15 (horario_id=46) LAB-3
(88, 22, 58, 3, 2),  -- SABADO 16:30 (horario_id=58) LAB-3
(89, 22, 59, 3, 3),  -- SABADO 17:30 (horario_id=59) LAB-3
(90, 22, 60, 3, 4);  -- SABADO 18:15 (horario_id=60) LAB-3

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (SEGUNDO A - NOCHE): 8 cursos = 30 registros (IDs 61-90)
--   ESTADÍSTICA: 2 registros (61-62) - LUNES Periodos 4-5
--   PROGRAMACIÓN II: 6 registros (63-68) - MARTES Periodos 1-3, MIERCOLES Periodos 1-3
--   ESTRUCTURA DE DATOS: 2 registros (69-70) - MIERCOLES Periodos 4-5
--   REDES DE COMPUTADORAS I: 4 registros (71-74) - VIERNES Periodos 1-2, JUEVES Periodos 4-5
--   PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I: 4 registros (75-78) - MARTES Periodos 4-5, SABADO Periodos 1-2
--   ANÁLISIS Y DISEÑO DE SISTEMAS I: 4 registros (79-82) - JUEVES Periodo 3, VIERNES Periodos 3-5
--   DISEÑO Y PROGRAMACIÓN WEB II: 4 registros (83-86) - LUNES Periodos 1-3, JUEVES Periodo 2
--   BASE DE DATOS I: 4 registros (87-90) - JUEVES Periodo 1, SABADO Periodos 3-5
--
-- TOTAL: 30 registros (IDs 61-90)
-- Continuación desde el último ID del seeder de primer año (60)
-- NOTA: Horarios corregidos según imagen oficial del horario académico 2026
-- ============================================
-- FIN DEL SEEDER
-- ============================================
