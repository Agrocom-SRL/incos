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

-- Fuente: dump servidor 2026-05-29 — 60 bloques (oferta 1–14)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(9, 1, 41, NULL, 1),
(10, 1, 42, NULL, 2),
(11, 1, 49, NULL, 3),
(12, 1, 50, NULL, 4);

-- asignacion_docente_id = 2
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(1, 2, 36, NULL, 1),
(2, 2, 37, NULL, 2),
(3, 2, 38, NULL, 3),
(4, 2, 39, NULL, 4),
(5, 2, 40, NULL, 5),
(6, 2, 48, NULL, 6),
(7, 2, 56, NULL, 7),
(8, 2, 57, NULL, 8);

-- asignacion_docente_id = 3
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(13, 3, 59, 12, 1),
(14, 3, 60, 12, 2);

-- asignacion_docente_id = 4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(15, 4, 51, NULL, 1),
(16, 4, 52, NULL, 2),
(17, 4, 53, NULL, 3),
(18, 4, 54, NULL, 4);

-- asignacion_docente_id = 5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(19, 5, 31, NULL, 1),
(20, 5, 32, NULL, 2),
(21, 5, 33, NULL, 3),
(22, 5, 55, NULL, 4);

-- asignacion_docente_id = 6
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(23, 6, 46, NULL, 1),
(24, 6, 47, NULL, 2),
(25, 6, 43, NULL, 3),
(26, 6, 58, 1, 4);

-- asignacion_docente_id = 7
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(27, 7, 34, NULL, 1),
(28, 7, 35, NULL, 2),
(29, 7, 44, 1, 3),
(30, 7, 45, 1, 4);

-- asignacion_docente_id = 8
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(39, 8, 46, NULL, 1),
(40, 8, 47, NULL, 2),
(41, 8, 44, 4, 3),
(42, 8, 45, 4, 4);

-- asignacion_docente_id = 9
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(31, 9, 31, NULL, 1),
(32, 9, 32, NULL, 2),
(33, 9, 33, NULL, 3),
(34, 9, 34, NULL, 4),
(35, 9, 35, NULL, 5),
(36, 9, 51, 2, 6),
(37, 9, 52, 2, 7),
(38, 9, 53, 2, 8);

-- asignacion_docente_id = 10
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(43, 10, 56, NULL, 1),
(44, 10, 57, NULL, 2);

-- asignacion_docente_id = 11
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(45, 11, 41, NULL, 1),
(46, 11, 42, NULL, 2),
(47, 11, 54, NULL, 3),
(48, 11, 55, NULL, 4);

-- asignacion_docente_id = 12
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(49, 12, 48, NULL, 1),
(50, 12, 58, 4, 2),
(51, 12, 59, 4, 3),
(52, 12, 60, 4, 4);

-- asignacion_docente_id = 13
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(53, 13, 36, NULL, 1),
(54, 13, 37, NULL, 2),
(55, 13, 38, NULL, 3),
(56, 13, 43, NULL, 4);

-- asignacion_docente_id = 14
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(57, 14, 39, NULL, 1),
(58, 14, 40, NULL, 2),
(59, 14, 49, NULL, 3),
(60, 14, 50, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques asignacion_horarios (oferta 1–14)
