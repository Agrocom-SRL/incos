-- ============================================
-- SEEDER: oferta_cursos — CONTADURÍA GENERAL (V2)
-- Sistema de Gestión Académica - Instituto INCOS
-- Sprint 3 — Oferta Académica (paso 2: materias por paralelo-gestión)
-- ============================================
-- Pre-requisitos: 27-seed-paralelos-gestion, 14-seed-asignaturas-plan
-- IDs fijos: 75–140 (CON-GEN)
-- paralelo_gestion_id: 11–18

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- PRIMER AÑO — asignaturas_plan 46–54

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(75, 11, 46, 'ACTIVA', TRUE),
(76, 11, 47, 'ACTIVA', TRUE),
(77, 11, 48, 'ACTIVA', TRUE),
(78, 11, 49, 'ACTIVA', TRUE),
(79, 11, 50, 'ACTIVA', TRUE),
(80, 11, 51, 'ACTIVA', TRUE),
(81, 11, 52, 'ACTIVA', TRUE),
(82, 11, 53, 'ACTIVA', TRUE),
(83, 11, 54, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(84, 12, 46, 'ACTIVA', TRUE),
(85, 12, 47, 'ACTIVA', TRUE),
(86, 12, 48, 'ACTIVA', TRUE),
(87, 12, 49, 'ACTIVA', TRUE),
(88, 12, 50, 'ACTIVA', TRUE),
(89, 12, 51, 'ACTIVA', TRUE),
(90, 12, 52, 'ACTIVA', TRUE),
(91, 12, 53, 'ACTIVA', TRUE),
(92, 12, 54, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(93, 13, 46, 'ACTIVA', TRUE),
(94, 13, 47, 'ACTIVA', TRUE),
(95, 13, 48, 'ACTIVA', TRUE),
(96, 13, 49, 'ACTIVA', TRUE),
(97, 13, 50, 'ACTIVA', TRUE),
(98, 13, 51, 'ACTIVA', TRUE),
(99, 13, 52, 'ACTIVA', TRUE),
(100, 13, 53, 'ACTIVA', TRUE),
(101, 13, 54, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(102, 14, 46, 'ACTIVA', TRUE),
(103, 14, 47, 'ACTIVA', TRUE),
(104, 14, 48, 'ACTIVA', TRUE),
(105, 14, 49, 'ACTIVA', TRUE),
(106, 14, 50, 'ACTIVA', TRUE),
(107, 14, 51, 'ACTIVA', TRUE),
(108, 14, 52, 'ACTIVA', TRUE),
(109, 14, 53, 'ACTIVA', TRUE),
(110, 14, 54, 'ACTIVA', TRUE);

-- SEGUNDO AÑO — asignaturas_plan 55–61

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(111, 15, 55, 'ACTIVA', TRUE),
(112, 15, 56, 'ACTIVA', TRUE),
(113, 15, 57, 'ACTIVA', TRUE),
(114, 15, 58, 'ACTIVA', TRUE),
(115, 15, 59, 'ACTIVA', TRUE),
(116, 15, 60, 'ACTIVA', TRUE),
(117, 15, 61, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(118, 16, 55, 'ACTIVA', TRUE),
(119, 16, 56, 'ACTIVA', TRUE),
(120, 16, 57, 'ACTIVA', TRUE),
(121, 16, 58, 'ACTIVA', TRUE),
(122, 16, 59, 'ACTIVA', TRUE),
(123, 16, 60, 'ACTIVA', TRUE),
(124, 16, 61, 'ACTIVA', TRUE);

-- TERCER AÑO — asignaturas_plan 62–69

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(125, 17, 62, 'ACTIVA', TRUE),
(126, 17, 63, 'ACTIVA', TRUE),
(127, 17, 64, 'ACTIVA', TRUE),
(128, 17, 65, 'ACTIVA', TRUE),
(129, 17, 66, 'ACTIVA', TRUE),
(130, 17, 67, 'ACTIVA', TRUE),
(131, 17, 68, 'ACTIVA', TRUE),
(132, 17, 69, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(133, 18, 62, 'ACTIVA', TRUE),
(134, 18, 63, 'ACTIVA', TRUE),
(135, 18, 64, 'ACTIVA', TRUE),
(136, 18, 65, 'ACTIVA', TRUE),
(137, 18, 66, 'ACTIVA', TRUE),
(138, 18, 67, 'ACTIVA', TRUE),
(139, 18, 68, 'ACTIVA', TRUE),
(140, 18, 69, 'ACTIVA', TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 66 oferta_cursos (CON-GEN)
