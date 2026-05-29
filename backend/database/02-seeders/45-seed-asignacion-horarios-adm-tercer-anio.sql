-- ============================================
-- SEEDER: asignacion_horarios - ADMINISTRACIÓN TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 2 (ADM-EMP) → Periodo 3 → Paralelo 3A → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 68-74 (3A: 68-74)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Continuación desde último ID del seeder de Administración segundo año: 271

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: dump servidor 2026-05-29 — 32 bloques (oferta 68–74)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 68
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(272, 68, 31, NULL, 1),
(273, 68, 32, NULL, 2),
(274, 68, 33, NULL, 3),
(275, 68, 34, NULL, 4),
(276, 68, 35, NULL, 5),
(277, 68, 41, NULL, 6);

-- asignacion_docente_id = 69
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(278, 69, 46, NULL, 1),
(279, 69, 47, NULL, 2),
(280, 69, 49, NULL, 3),
(555, 69, 54, NULL, 3),
(281, 69, 50, NULL, 4),
(556, 69, 55, NULL, 4);

-- asignacion_docente_id = 70
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(282, 70, 42, NULL, 1),
(283, 70, 43, NULL, 2),
(284, 70, 44, NULL, 3),
(285, 70, 45, NULL, 4);

-- asignacion_docente_id = 71
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(286, 71, 48, NULL, 1),
(287, 71, 58, NULL, 2),
(288, 71, 59, NULL, 3),
(289, 71, 60, NULL, 4);

-- asignacion_docente_id = 72
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(557, 72, 49, NULL, 1),
(558, 72, 50, NULL, 2),
(290, 72, 39, NULL, 3),
(291, 72, 40, NULL, 4);

-- asignacion_docente_id = 73
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(292, 73, 37, NULL, 1),
(293, 73, 38, NULL, 2),
(294, 73, 56, NULL, 3),
(295, 73, 57, NULL, 4);

-- asignacion_docente_id = 74
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(296, 74, 36, NULL, 1),
(297, 74, 51, NULL, 2),
(298, 74, 52, NULL, 3),
(299, 74, 53, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 32 bloques asignacion_horarios (oferta 68–74)
