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
-- Bloques PK (asignacion_horarios.id): 271–300 (continúa desde seeder 44, id 270)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 32 bloques (oferta 68–74)
-- asignacion_docente_id = asignaciones_docentes.id (= oferta en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 68
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(271, 68, 36, NULL, 1),
(272, 68, 56, NULL, 2),
(273, 68, 57, NULL, 3),
(274, 68, 58, NULL, 4),
(275, 68, 59, NULL, 5),
(276, 68, 60, NULL, 6);

-- asignacion_docente_id = 69
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(277, 69, 52, NULL, 1),
(278, 69, 53, NULL, 2),
(279, 69, 54, NULL, 3),
(280, 69, 55, NULL, 4);

-- asignacion_docente_id = 70
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(281, 70, 46, NULL, 1),
(282, 70, 47, NULL, 2),
(283, 70, 48, NULL, 3),
(284, 70, 51, NULL, 4);

-- asignacion_docente_id = 71
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(285, 71, 34, NULL, 1),
(286, 71, 35, NULL, 2),
(287, 71, 49, NULL, 3),
(288, 71, 50, NULL, 4);

-- asignacion_docente_id = 72 (ids 290-293)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(289, 72, 42, NULL, 1),
(290, 72, 43, NULL, 2),
(291, 72, 44, NULL, 3),
(292, 72, 45, NULL, 4);

-- asignacion_docente_id = 73 (ids 294-297)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(293, 73, 31, NULL, 1),
(294, 73, 32, NULL, 2),
(295, 73, 33, NULL, 3),
(296, 73, 37, NULL, 4);

-- asignacion_docente_id = 74 (bloques 297-300; CON primer año continúa en 301)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(297, 74, 38, NULL, 1),
(298, 74, 39, NULL, 2),
(299, 74, 40, NULL, 3),
(300, 74, 41, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 30 bloques asignacion_horarios (Excel 2026-02-18)
