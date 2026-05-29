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

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 60 bloques (oferta 52–67)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 52
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(211, 52, 13, NULL, 1),
(212, 52, 14, NULL, 2);

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
(223, 55, 19, NULL, 3),
(224, 55, 20, NULL, 4);

-- asignacion_docente_id = 56
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(225, 56, 5, NULL, 1),
(226, 56, 6, NULL, 2),
(227, 56, 29, NULL, 3),
(228, 56, 30, NULL, 4);

-- asignacion_docente_id = 57
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(229, 57, 25, NULL, 1),
(230, 57, 26, NULL, 2),
(231, 57, 27, NULL, 3),
(232, 57, 28, NULL, 4);

-- asignacion_docente_id = 58
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(233, 58, 11, NULL, 1),
(234, 58, 12, NULL, 2),
(235, 58, 17, NULL, 3),
(236, 58, 18, NULL, 4);

-- asignacion_docente_id = 59
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(237, 59, 21, NULL, 1),
(238, 59, 22, NULL, 2),
(239, 59, 23, NULL, 3),
(240, 59, 24, NULL, 4);

-- asignacion_docente_id = 60
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(241, 60, 54, NULL, 1),
(242, 60, 55, NULL, 2);

-- asignacion_docente_id = 61
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(243, 61, 56, NULL, 1),
(244, 61, 57, NULL, 2),
(245, 61, 58, NULL, 3),
(246, 61, 59, NULL, 4);

-- asignacion_docente_id = 62
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(247, 62, 31, NULL, 1),
(248, 62, 32, NULL, 2),
(249, 62, 33, NULL, 3),
(250, 62, 60, NULL, 4);

-- asignacion_docente_id = 63
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(251, 63, 41, NULL, 1),
(252, 63, 42, NULL, 2),
(253, 63, 46, NULL, 3),
(254, 63, 47, NULL, 4);

-- asignacion_docente_id = 64
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(255, 64, 40, NULL, 1),
(256, 64, 51, NULL, 2),
(257, 64, 52, NULL, 3),
(258, 64, 53, NULL, 4);

-- asignacion_docente_id = 65
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(259, 65, 34, NULL, 1),
(260, 65, 35, NULL, 2),
(261, 65, 49, NULL, 3),
(262, 65, 50, NULL, 4);

-- asignacion_docente_id = 66
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(263, 66, 37, NULL, 1),
(264, 66, 38, NULL, 2),
(265, 66, 39, NULL, 3),
(266, 66, 48, NULL, 4);

-- asignacion_docente_id = 67
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(267, 67, 36, NULL, 1),
(268, 67, 43, NULL, 2),
(269, 67, 44, NULL, 3),
(270, 67, 45, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques asignacion_horarios (Excel 2026-02-18)
