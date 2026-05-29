-- ============================================
-- SEEDER: asignacion_horarios - ADMINISTRACIÓN PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (NOCHE), PRIMERO C (NOCHE)
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

-- Fuente: dump servidor 2026-05-29 — 93 bloques (oferta 31–51)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 31
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(121, 31, 1, NULL, 1),
(122, 31, 2, NULL, 2),
(123, 31, 3, NULL, 3),
(124, 31, 4, NULL, 4),
(125, 31, 17, NULL, 5),
(126, 31, 18, NULL, 6);

-- asignacion_docente_id = 32
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(127, 32, 13, NULL, 1),
(128, 32, 14, NULL, 2),
(129, 32, 15, NULL, 3),
(130, 32, 16, NULL, 4),
(131, 32, 19, NULL, 5),
(132, 32, 20, NULL, 6);

-- asignacion_docente_id = 33
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(133, 33, 27, NULL, 1),
(134, 33, 28, NULL, 2),
(135, 33, 29, NULL, 3),
(136, 33, 30, NULL, 4);

-- asignacion_docente_id = 34
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(137, 34, 7, NULL, 1),
(138, 34, 8, NULL, 2),
(139, 34, 9, NULL, 3),
(140, 34, 10, NULL, 4);

-- asignacion_docente_id = 35
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(141, 35, 11, NULL, 1),
(142, 35, 12, NULL, 2),
(143, 35, 23, NULL, 3),
(144, 35, 24, NULL, 4);

-- asignacion_docente_id = 36
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(145, 36, 5, 1, 1),
(146, 36, 6, 1, 2);

-- asignacion_docente_id = 37
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(147, 37, 21, NULL, 1),
(148, 37, 22, NULL, 2),
(149, 37, 25, NULL, 3),
(150, 37, 26, NULL, 4);

-- asignacion_docente_id = 38
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(154, 38, 46, NULL, 1),
(155, 38, 47, NULL, 2),
(156, 38, 48, NULL, 3),
(151, 38, 38, NULL, 4),
(152, 38, 39, NULL, 5),
(153, 38, 40, NULL, 6);

-- asignacion_docente_id = 39
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(157, 39, 49, NULL, 1),
(158, 39, 50, NULL, 2),
(160, 39, 56, NULL, 3),
(161, 39, 57, NULL, 4),
(162, 39, 58, NULL, 5),
(159, 39, 53, NULL, 6);

-- asignacion_docente_id = 40
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(163, 40, 42, NULL, 1),
(164, 40, 43, NULL, 2),
(165, 40, 44, NULL, 3),
(166, 40, 45, NULL, 4);

-- asignacion_docente_id = 41
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(169, 41, 59, NULL, 1),
(170, 41, 60, NULL, 2),
(167, 41, 51, NULL, 3),
(168, 41, 52, NULL, 4);

-- asignacion_docente_id = 42
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(171, 42, 33, NULL, 1),
(172, 42, 34, NULL, 1),
(540, 42, 35, NULL, 2),
(173, 42, 36, NULL, 3),
(174, 42, 37, NULL, 4);

-- asignacion_docente_id = 43
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(175, 43, 54, NULL, 1),
(176, 43, 55, NULL, 2);

-- asignacion_docente_id = 44
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(177, 44, 31, NULL, 1),
(178, 44, 32, NULL, 2),
(179, 44, 33, NULL, 3),
(180, 44, 41, NULL, 4);

-- asignacion_docente_id = 45
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(181, 45, 31, NULL, 1),
(182, 45, 32, NULL, 2),
(185, 45, 59, NULL, 3),
(186, 45, 60, NULL, 4),
(183, 45, 51, NULL, 5),
(184, 45, 52, NULL, 6);

-- asignacion_docente_id = 46
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(187, 46, 38, NULL, 1),
(188, 46, 39, NULL, 2),
(189, 46, 40, NULL, 3),
(190, 46, 53, NULL, 4),
(191, 46, 54, NULL, 5),
(192, 46, 55, NULL, 6);

-- asignacion_docente_id = 47
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(193, 47, 33, NULL, 1),
(195, 47, 49, NULL, 1),
(196, 47, 50, NULL, 2),
(194, 47, 34, NULL, 3),
(553, 47, 35, NULL, 4);

-- asignacion_docente_id = 48
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(197, 48, 36, NULL, 1),
(198, 48, 37, NULL, 2),
(199, 48, 44, NULL, 3),
(200, 48, 45, NULL, 4);

-- asignacion_docente_id = 49
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(201, 49, 35, NULL, 1),
(554, 49, 33, NULL, 1),
(202, 49, 56, NULL, 2),
(203, 49, 57, NULL, 3),
(204, 49, 58, NULL, 4);

-- asignacion_docente_id = 50
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(205, 50, 42, NULL, 1),
(206, 50, 43, NULL, 2);

-- asignacion_docente_id = 51
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(208, 51, 46, NULL, 1),
(209, 51, 47, NULL, 2),
(210, 51, 48, NULL, 3),
(207, 51, 41, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 93 bloques asignacion_horarios (oferta 31–51)
