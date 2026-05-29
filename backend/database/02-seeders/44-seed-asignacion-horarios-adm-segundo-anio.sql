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

-- Fuente: dump servidor 2026-05-29 — 60 bloques (oferta 52–67)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 52
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(211, 52, 23, NULL, 1),
(212, 52, 24, NULL, 2);

-- asignacion_docente_id = 53
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(213, 53, 7, NULL, 1),
(214, 53, 8, NULL, 2),
(215, 53, 9, NULL, 3),
(216, 53, 10, NULL, 4);

-- asignacion_docente_id = 54
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(217, 54, 1, NULL, 1),
(218, 54, 2, NULL, 2),
(219, 54, 3, NULL, 3),
(220, 54, 4, NULL, 4);

-- asignacion_docente_id = 55
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(221, 55, 15, NULL, 1),
(222, 55, 16, NULL, 2),
(223, 55, 17, NULL, 3),
(224, 55, 18, NULL, 4);

-- asignacion_docente_id = 56
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(225, 56, 5, NULL, 1),
(226, 56, 6, NULL, 2),
(227, 56, 11, NULL, 3),
(228, 56, 12, NULL, 4);

-- asignacion_docente_id = 57
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(229, 57, 27, NULL, 1),
(230, 57, 28, NULL, 2),
(231, 57, 29, NULL, 3),
(232, 57, 30, NULL, 4);

-- asignacion_docente_id = 58
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(233, 58, 13, NULL, 1),
(234, 58, 14, NULL, 2),
(235, 58, 19, NULL, 3),
(236, 58, 20, NULL, 4);

-- asignacion_docente_id = 59
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(237, 59, 21, NULL, 1),
(238, 59, 22, NULL, 2),
(239, 59, 25, NULL, 3),
(240, 59, 26, NULL, 4);

-- asignacion_docente_id = 60
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(241, 60, 31, NULL, 1),
(242, 60, 32, NULL, 2);

-- asignacion_docente_id = 61
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(243, 61, 53, NULL, 1),
(244, 61, 54, NULL, 2),
(245, 61, 55, NULL, 3),
(246, 61, 56, NULL, 4);

-- asignacion_docente_id = 62
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(247, 62, 57, NULL, 1),
(248, 62, 58, NULL, 2),
(249, 62, 59, NULL, 3),
(250, 62, 60, NULL, 4);

-- asignacion_docente_id = 63
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(251, 63, 47, NULL, 1),
(252, 63, 48, NULL, 2),
(253, 63, 49, NULL, 3),
(254, 63, 50, NULL, 4);

-- asignacion_docente_id = 64
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(255, 64, 36, NULL, 1),
(256, 64, 37, NULL, 2),
(257, 64, 51, NULL, 3),
(258, 64, 52, NULL, 4);

-- asignacion_docente_id = 65
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(259, 65, 42, NULL, 1),
(260, 65, 43, NULL, 2),
(261, 65, 44, NULL, 3),
(262, 65, 45, NULL, 4);

-- asignacion_docente_id = 66
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(263, 66, 38, NULL, 1),
(264, 66, 39, NULL, 2),
(265, 66, 40, NULL, 3),
(266, 66, 46, NULL, 4);

-- asignacion_docente_id = 67
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(267, 67, 33, NULL, 1),
(268, 67, 34, NULL, 2),
(269, 67, 35, NULL, 3),
(270, 67, 41, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques asignacion_horarios (oferta 52–67)
