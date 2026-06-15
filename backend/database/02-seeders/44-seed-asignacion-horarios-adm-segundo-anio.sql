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
-- Bloques PK (asignacion_horarios.id): 211–270 (continúa desde seeder 43, id 210)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 60 bloques (oferta 52–67)
-- asignacion_docente_id = asignaciones_docentes.id (= oferta en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 52
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(211, 52, 13, 1),
(212, 52, 14, 2);

-- asignacion_docente_id = 53
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(213, 53, 7, 1),
(214, 53, 8, 2),
(215, 53, 9, 3),
(216, 53, 10, 4);

-- asignacion_docente_id = 54
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(217, 54, 1, 1),
(218, 54, 2, 2),
(219, 54, 3, 3),
(220, 54, 4, 4);

-- asignacion_docente_id = 55
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(221, 55, 15, 1),
(222, 55, 16, 2),
(223, 55, 19, 3),
(224, 55, 20, 4);

-- asignacion_docente_id = 56
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(225, 56, 5, 1),
(226, 56, 6, 2),
(227, 56, 29, 3),
(228, 56, 30, 4);

-- asignacion_docente_id = 57
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(229, 57, 25, 1),
(230, 57, 26, 2),
(231, 57, 27, 3),
(232, 57, 28, 4);

-- asignacion_docente_id = 58
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(233, 58, 11, 1),
(234, 58, 12, 2),
(235, 58, 17, 3),
(236, 58, 18, 4);

-- asignacion_docente_id = 59
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(237, 59, 21, 1),
(238, 59, 22, 2),
(239, 59, 23, 3),
(240, 59, 24, 4);

-- asignacion_docente_id = 60
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(241, 60, 54, 1),
(242, 60, 55, 2);

-- asignacion_docente_id = 61
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(243, 61, 56, 1),
(244, 61, 57, 2),
(245, 61, 58, 3),
(246, 61, 59, 4);

-- asignacion_docente_id = 62
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(247, 62, 31, 1),
(248, 62, 32, 2),
(249, 62, 33, 3),
(250, 62, 60, 4);

-- asignacion_docente_id = 63
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(251, 63, 41, 1),
(252, 63, 42, 2),
(253, 63, 46, 3),
(254, 63, 47, 4);

-- asignacion_docente_id = 64
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(255, 64, 40, 1),
(256, 64, 51, 2),
(257, 64, 52, 3),
(258, 64, 53, 4);

-- asignacion_docente_id = 65
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(259, 65, 34, 1),
(260, 65, 35, 2),
(261, 65, 49, 3),
(262, 65, 50, 4);

-- asignacion_docente_id = 66
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(263, 66, 37, 1),
(264, 66, 38, 2),
(265, 66, 39, 3),
(266, 66, 48, 4);

-- asignacion_docente_id = 67
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(267, 67, 36, 1),
(268, 67, 43, 2),
(269, 67, 44, 3),
(270, 67, 45, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques asignacion_horarios (Excel 2026-02-18)
