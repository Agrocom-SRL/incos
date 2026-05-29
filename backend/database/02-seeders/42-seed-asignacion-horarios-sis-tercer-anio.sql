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

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 30 bloques (oferta 23–30)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 23
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(91, 23, 39, NULL, 1),
(92, 23, 40, NULL, 2),
(93, 23, 59, NULL, 3),
(94, 23, 60, NULL, 4);

-- asignacion_docente_id = 24
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(95, 24, 36, NULL, 1),
(96, 24, 37, NULL, 2),
(97, 24, 56, NULL, 3),
(98, 24, 57, NULL, 4);

-- asignacion_docente_id = 25
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(99, 25, 47, NULL, 1),
(100, 25, 48, NULL, 2);

-- asignacion_docente_id = 26
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(101, 26, 43, NULL, 1),
(102, 26, 44, NULL, 2),
(103, 26, 45, NULL, 3),
(104, 26, 46, NULL, 4);

-- asignacion_docente_id = 27
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(105, 27, 31, NULL, 1),
(106, 27, 32, NULL, 2),
(107, 27, 49, NULL, 3),
(108, 27, 50, NULL, 4);

-- asignacion_docente_id = 28
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(109, 28, 41, NULL, 1),
(110, 28, 42, NULL, 2),
(111, 28, 54, NULL, 3),
(112, 28, 55, NULL, 4);

-- asignacion_docente_id = 29
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(113, 29, 33, NULL, 1),
(114, 29, 34, NULL, 2),
(115, 29, 35, NULL, 3),
(116, 29, 38, NULL, 4);

-- asignacion_docente_id = 30
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(117, 30, 51, NULL, 1),
(118, 30, 52, NULL, 2),
(119, 30, 53, NULL, 3),
(120, 30, 58, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 30 bloques asignacion_horarios (Excel 2026-02-18)
