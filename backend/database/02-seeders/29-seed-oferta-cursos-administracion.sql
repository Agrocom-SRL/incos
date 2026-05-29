-- ============================================
-- SEEDER: oferta_cursos — ADMINISTRACIÓN DE EMPRESAS (V2)
-- Sistema de Gestión Académica - Instituto INCOS
-- Sprint 3 — Oferta Académica (paso 2: materias por paralelo-gestión)
-- ============================================
-- Pre-requisitos: 27-seed-paralelos-gestion, 14-seed-asignaturas-plan
-- IDs fijos: 31–74 (ADM-EMP)
-- paralelo_gestion_id: 5–10

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- PRIMER AÑO — asignaturas_plan 24–30

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(31, 5, 24, 'ACTIVA', TRUE),
(32, 5, 25, 'ACTIVA', TRUE),
(33, 5, 26, 'ACTIVA', TRUE),
(34, 5, 27, 'ACTIVA', TRUE),
(35, 5, 28, 'ACTIVA', TRUE),
(36, 5, 29, 'ACTIVA', TRUE),
(37, 5, 30, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(38, 6, 24, 'ACTIVA', TRUE),
(39, 6, 25, 'ACTIVA', TRUE),
(40, 6, 26, 'ACTIVA', TRUE),
(41, 6, 27, 'ACTIVA', TRUE),
(42, 6, 28, 'ACTIVA', TRUE),
(43, 6, 29, 'ACTIVA', TRUE),
(44, 6, 30, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(45, 7, 24, 'ACTIVA', TRUE),
(46, 7, 25, 'ACTIVA', TRUE),
(47, 7, 26, 'ACTIVA', TRUE),
(48, 7, 27, 'ACTIVA', TRUE),
(49, 7, 28, 'ACTIVA', TRUE),
(50, 7, 29, 'ACTIVA', TRUE),
(51, 7, 30, 'ACTIVA', TRUE);

-- SEGUNDO AÑO — asignaturas_plan 31–38

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(52, 8, 31, 'ACTIVA', TRUE),
(53, 8, 32, 'ACTIVA', TRUE),
(54, 8, 33, 'ACTIVA', TRUE),
(55, 8, 34, 'ACTIVA', TRUE),
(56, 8, 35, 'ACTIVA', TRUE),
(57, 8, 36, 'ACTIVA', TRUE),
(58, 8, 37, 'ACTIVA', TRUE),
(59, 8, 38, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(60, 9, 31, 'ACTIVA', TRUE),
(61, 9, 32, 'ACTIVA', TRUE),
(62, 9, 33, 'ACTIVA', TRUE),
(63, 9, 34, 'ACTIVA', TRUE),
(64, 9, 35, 'ACTIVA', TRUE),
(65, 9, 36, 'ACTIVA', TRUE),
(66, 9, 37, 'ACTIVA', TRUE),
(67, 9, 38, 'ACTIVA', TRUE);

-- TERCER AÑO — asignaturas_plan 39–45

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(68, 10, 39, 'ACTIVA', TRUE),
(69, 10, 40, 'ACTIVA', TRUE),
(70, 10, 41, 'ACTIVA', TRUE),
(71, 10, 42, 'ACTIVA', TRUE),
(72, 10, 43, 'ACTIVA', TRUE),
(73, 10, 44, 'ACTIVA', TRUE),
(74, 10, 45, 'ACTIVA', TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 44 oferta_cursos (ADM-EMP)
