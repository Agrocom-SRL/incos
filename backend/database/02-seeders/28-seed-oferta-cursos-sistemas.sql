-- ============================================
-- SEEDER: oferta_cursos — SISTEMAS INFORMÁTICOS
-- Sistema de Gestión Académica - Instituto INCOS
-- Sprint 3 — Oferta Académica (paso 2: materias por paralelo-gestión)
-- ============================================
-- Pre-requisitos: 27-seed-paralelos-gestion, 14-seed-asignaturas-plan
-- IDs fijos oferta_cursos: 1–30 (SIS-INF)
-- paralelo_gestion_id: 1=1°A, 2=1°B, 3=2°A, 4=3°A

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- PRIMER AÑO (paralelo_gestion_id = 1 y 2) — asignaturas_plan 1–7

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(1, 1, 1, 'ACTIVA', TRUE),
(2, 1, 2, 'ACTIVA', TRUE),
(3, 1, 3, 'ACTIVA', TRUE),
(4, 1, 4, 'ACTIVA', TRUE),
(5, 1, 5, 'ACTIVA', TRUE),
(6, 1, 6, 'ACTIVA', TRUE),
(7, 1, 7, 'ACTIVA', TRUE);

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(8, 2, 1, 'ACTIVA', TRUE),
(9, 2, 2, 'ACTIVA', TRUE),
(10, 2, 3, 'ACTIVA', TRUE),
(11, 2, 4, 'ACTIVA', TRUE),
(12, 2, 5, 'ACTIVA', TRUE),
(13, 2, 6, 'ACTIVA', TRUE),
(14, 2, 7, 'ACTIVA', TRUE);

-- SEGUNDO AÑO (paralelo_gestion_id = 3) — asignaturas_plan 8–15

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(15, 3, 8, 'ACTIVA', TRUE),
(16, 3, 9, 'ACTIVA', TRUE),
(17, 3, 10, 'ACTIVA', TRUE),
(18, 3, 11, 'ACTIVA', TRUE),
(19, 3, 12, 'ACTIVA', TRUE),
(20, 3, 13, 'ACTIVA', TRUE),
(21, 3, 14, 'ACTIVA', TRUE),
(22, 3, 15, 'ACTIVA', TRUE);

-- TERCER AÑO (paralelo_gestion_id = 4) — asignaturas_plan 16–23

INSERT INTO oferta_cursos (id, paralelo_gestion_id, asignatura_plan_id, estado, activo) VALUES
(23, 4, 16, 'ACTIVA', TRUE),
(24, 4, 17, 'ACTIVA', TRUE),
(25, 4, 18, 'ACTIVA', TRUE),
(26, 4, 19, 'ACTIVA', TRUE),
(27, 4, 20, 'ACTIVA', TRUE),
(28, 4, 21, 'ACTIVA', TRUE),
(29, 4, 22, 'ACTIVA', TRUE),
(30, 4, 23, 'ACTIVA', TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 30 oferta_cursos (SIS-INF)
