-- ============================================
-- SEEDER: asignacion_horarios - ADMINISTRACIÓN PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (TARDE), PRIMERO C (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 2 (ADM-EMP) → Periodo 1 → Paralelos → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 31-51 (1A: 31-37, 1B: 38-44, 1C: 45-51)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-1=1
-- Continuación desde último ID del seeder de Sistemas tercer año: 120

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 93 bloques (oferta 31–51)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 31
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(121, 31, 5, NULL, 1),
(122, 31, 6, NULL, 2),
(123, 31, 21, NULL, 3),
(124, 31, 22, NULL, 4),
(125, 31, 23, NULL, 5),
(126, 31, 24, NULL, 6);

-- asignacion_docente_id = 32
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(127, 32, 19, NULL, 1),
(128, 32, 20, NULL, 2),
(129, 32, 25, NULL, 3),
(130, 32, 26, NULL, 4),
(131, 32, 27, NULL, 5),
(132, 32, 28, NULL, 6);

-- asignacion_docente_id = 33
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(133, 33, 9, NULL, 1),
(134, 33, 10, NULL, 2),
(135, 33, 11, NULL, 3),
(136, 33, 12, NULL, 4);

-- asignacion_docente_id = 34
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(137, 34, 1, NULL, 1),
(138, 34, 2, NULL, 2),
(139, 34, 3, NULL, 3),
(140, 34, 4, NULL, 4);

-- asignacion_docente_id = 35
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(141, 35, 13, 1, 1),
(142, 35, 14, 1, 2),
(143, 35, 15, 1, 3),
(144, 35, 16, 1, 4);

-- asignacion_docente_id = 36
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(145, 36, 7, 1, 1),
(146, 36, 8, 1, 2);

-- asignacion_docente_id = 37
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(147, 37, 17, NULL, 1),
(148, 37, 18, NULL, 2),
(149, 37, 29, NULL, 3),
(150, 37, 30, NULL, 4);

-- asignacion_docente_id = 38 — Fundamentos (6h JUEVES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(151, 38, 19, NULL, 1),
(152, 38, 20, NULL, 2),
(153, 38, 21, NULL, 3),
(154, 38, 22, NULL, 4),
(155, 38, 23, NULL, 5),
(156, 38, 24, NULL, 6);

-- asignacion_docente_id = 39 — Contabilidad (6h LUN/MIE/VIE TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(157, 39, 5, NULL, 1),
(158, 39, 6, NULL, 2),
(159, 39, 17, NULL, 3),
(160, 39, 18, NULL, 4),
(161, 39, 29, NULL, 5),
(162, 39, 30, NULL, 6);

-- asignacion_docente_id = 40 — Matemática Financiera (4h LUNES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(163, 40, 1, NULL, 1),
(164, 40, 2, NULL, 2),
(165, 40, 3, NULL, 3),
(166, 40, 4, NULL, 4);

-- asignacion_docente_id = 41 — Estadística (4h MARTES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(167, 41, 7, NULL, 1),
(168, 41, 8, NULL, 2),
(169, 41, 9, NULL, 3),
(170, 41, 10, NULL, 4);

-- asignacion_docente_id = 42 — Práctica Laboral (4h MIERCOLES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(171, 42, 13, 1, 1),
(172, 42, 14, 1, 2),
(173, 42, 15, 1, 3),
(174, 42, 16, 1, 4);

-- asignacion_docente_id = 43 — Informática Empresarial Lab 1 (2h MARTES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(175, 43, 11, 1, 1),
(176, 43, 12, 1, 2);

-- asignacion_docente_id = 44 — Inglés Técnico (4h VIERNES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(177, 44, 25, NULL, 1),
(178, 44, 26, NULL, 2),
(179, 44, 27, NULL, 3),
(180, 44, 28, NULL, 4);

-- asignacion_docente_id = 45
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(181, 45, 31, NULL, 1),
(182, 45, 32, NULL, 2),
(185, 45, 33, NULL, 3),
(186, 45, 46, NULL, 4),
(183, 45, 47, NULL, 5),
(184, 45, 48, NULL, 6);

-- asignacion_docente_id = 46
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(187, 46, 49, NULL, 1),
(188, 46, 50, NULL, 2),
(189, 46, 56, NULL, 3),
(190, 46, 57, NULL, 4),
(191, 46, 58, NULL, 5),
(192, 46, 59, NULL, 6);

-- asignacion_docente_id = 47
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(193, 47, 36, NULL, 1),
(194, 47, 41, NULL, 2),
(195, 47, 42, NULL, 3),
(196, 47, 43, NULL, 4);

-- asignacion_docente_id = 48
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(197, 48, 53, NULL, 1),
(198, 48, 54, NULL, 2),
(199, 48, 55, NULL, 3),
(200, 48, 60, NULL, 4);

-- asignacion_docente_id = 49
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(201, 49, 37, 1, 1),
(202, 49, 38, 1, 2),
(203, 49, 39, 1, 3),
(204, 49, 40, 1, 4);

-- asignacion_docente_id = 50
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(205, 50, 51, 1, 1),
(206, 50, 52, 1, 2);

-- asignacion_docente_id = 51
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(208, 51, 34, NULL, 1),
(209, 51, 35, NULL, 2),
(210, 51, 44, NULL, 3),
(207, 51, 45, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 90 bloques asignacion_horarios (Excel 2026-02-18)
