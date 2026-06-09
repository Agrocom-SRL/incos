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
-- Bloques PK (asignacion_horarios.id): 121–210 (continúa desde seeder 42, id 120)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 93 bloques (oferta 31–51)
-- asignacion_docente_id = asignaciones_docentes.id (= oferta en gestión 2026)
-- aula_id siempre NULL: hereda aula base de paralelos_gestion (sin override por bloque en seed)

-- asignacion_docente_id = 31
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(121, 31, 5, 1),
(122, 31, 6, 2),
(123, 31, 21, 3),
(124, 31, 22, 4),
(125, 31, 23, 5),
(126, 31, 24, 6);

-- asignacion_docente_id = 32
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(127, 32, 19, 1),
(128, 32, 20, 2),
(129, 32, 25, 3),
(130, 32, 26, 4),
(131, 32, 27, 5),
(132, 32, 28, 6);

-- asignacion_docente_id = 33
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(133, 33, 9, 1),
(134, 33, 10, 2),
(135, 33, 11, 3),
(136, 33, 12, 4);

-- asignacion_docente_id = 34
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(137, 34, 1, 1),
(138, 34, 2, 2),
(139, 34, 3, 3),
(140, 34, 4, 4);

-- asignacion_docente_id = 35
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(141, 35, 13, 1),
(142, 35, 14, 2),
(143, 35, 15, 3),
(144, 35, 16, 4);

-- asignacion_docente_id = 36
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(145, 36, 7, 1),
(146, 36, 8, 2);

-- asignacion_docente_id = 37
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(147, 37, 17, 1),
(148, 37, 18, 2),
(149, 37, 29, 3),
(150, 37, 30, 4);

-- asignacion_docente_id = 38 — Fundamentos (6h JUEVES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(151, 38, 19, 1),
(152, 38, 20, 2),
(153, 38, 21, 3),
(154, 38, 22, 4),
(155, 38, 23, 5),
(156, 38, 24, 6);

-- asignacion_docente_id = 39 — Contabilidad (6h LUN/MIE/VIE TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(157, 39, 5, 1),
(158, 39, 6, 2),
(159, 39, 17, 3),
(160, 39, 18, 4),
(161, 39, 29, 5),
(162, 39, 30, 6);

-- asignacion_docente_id = 40 — Matemática Financiera (4h LUNES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(163, 40, 1, 1),
(164, 40, 2, 2),
(165, 40, 3, 3),
(166, 40, 4, 4);

-- asignacion_docente_id = 41 — Estadística (4h MARTES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(167, 41, 7, 1),
(168, 41, 8, 2),
(169, 41, 9, 3),
(170, 41, 10, 4);

-- asignacion_docente_id = 42 — Práctica Laboral (4h MIERCOLES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(171, 42, 13, 1),
(172, 42, 14, 2),
(173, 42, 15, 3),
(174, 42, 16, 4);

-- asignacion_docente_id = 43 — Informática Empresarial Lab 1 (2h MARTES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(175, 43, 11, 1),
(176, 43, 12, 2);

-- asignacion_docente_id = 44 — Inglés Técnico (4h VIERNES TARDE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(177, 44, 25, 1),
(178, 44, 26, 2),
(179, 44, 27, 3),
(180, 44, 28, 4);

-- asignacion_docente_id = 45
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(181, 45, 31, 1),
(182, 45, 32, 2),
(183, 45, 33, 3),
(184, 45, 46, 4),
(185, 45, 47, 5),
(186, 45, 48, 6);

-- asignacion_docente_id = 46
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(187, 46, 49, 1),
(188, 46, 50, 2),
(189, 46, 56, 3),
(190, 46, 57, 4),
(191, 46, 58, 5),
(192, 46, 59, 6);

-- asignacion_docente_id = 47
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(193, 47, 36, 1),
(194, 47, 41, 2),
(195, 47, 42, 3),
(196, 47, 43, 4);

-- asignacion_docente_id = 48
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(197, 48, 53, 1),
(198, 48, 54, 2),
(199, 48, 55, 3),
(200, 48, 60, 4);

-- asignacion_docente_id = 49
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(201, 49, 37, 1),
(202, 49, 38, 2),
(203, 49, 39, 3),
(204, 49, 40, 4);

-- asignacion_docente_id = 50
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(205, 50, 51, 1),
(206, 50, 52, 2);

-- asignacion_docente_id = 51
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(207, 51, 34, 1),
(208, 51, 35, 2),
(209, 51, 44, 3),
(210, 51, 45, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 90 bloques asignacion_horarios (Excel 2026-02-18)
