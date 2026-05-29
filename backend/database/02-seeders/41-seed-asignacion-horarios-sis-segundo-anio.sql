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
-- Bloques PK (asignacion_horarios.id): 61–90 (continúa desde seeder 40, id 60)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 30 bloques (oferta 15–22)
-- asignacion_docente_id = asignaciones_docentes.id (= oferta en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 15
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(61, 15, 41, NULL, 1),
(62, 15, 42, NULL, 2);

-- asignacion_docente_id = 16
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(63, 16, 38, NULL, 1),
(64, 16, 39, NULL, 2),
(65, 16, 40, NULL, 3),
(66, 16, 53, NULL, 4),
(67, 16, 54, NULL, 5),
(68, 16, 55, NULL, 6);

-- asignacion_docente_id = 17
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(69, 17, 44, NULL, 1),
(70, 17, 45, NULL, 2);

-- asignacion_docente_id = 18
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(71, 18, 56, NULL, 1),
(72, 18, 57, NULL, 2),
(73, 18, 58, NULL, 3),
(74, 18, 59, NULL, 4);

-- asignacion_docente_id = 19
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(75, 19, 48, NULL, 1),
(76, 19, 49, NULL, 2),
(77, 19, 50, NULL, 3),
(78, 19, 60, NULL, 4);

-- asignacion_docente_id = 20
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(79, 20, 46, NULL, 1),
(80, 20, 47, NULL, 2),
(81, 20, 51, NULL, 3),
(82, 20, 52, NULL, 4);

-- asignacion_docente_id = 21
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(83, 21, 31, NULL, 1),
(84, 21, 32, NULL, 2),
(85, 21, 33, NULL, 3),
(86, 21, 43, NULL, 4);

-- asignacion_docente_id = 22
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(87, 22, 34, NULL, 1),
(88, 22, 35, NULL, 2),
(89, 22, 36, NULL, 3),
(90, 22, 37, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 30 bloques asignacion_horarios (Excel 2026-02-18)
