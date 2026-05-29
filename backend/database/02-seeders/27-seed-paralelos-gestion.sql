-- ============================================
-- SEEDER: paralelos_gestion — Gestión 2026 (V2)
-- Sistema de Gestión Académica - Instituto INCOS
-- Sprint 3 — Oferta Académica (paso 1: instanciar paralelos en la gestión)
-- ============================================
-- Pre-requisitos: 16-gestiones, 19-gestiones-planes, 25-paralelos
-- Siguiente: 28–30 seed-oferta-cursos-* (una por carrera)
--
-- IDs fijos: 1–18 (SIS 1–4, ADM 5–10, CON 11–18)
-- gestion_plan_id: 1=SIS, 2=ADM, 3=CON

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- SISTEMAS INFORMÁTICOS (gestion_plan_id = 1)
-- ============================================

INSERT INTO paralelos_gestion (id, gestion_plan_id, paralelo_id, turno, estado, cupo_maximo, cupo_minimo, activo) VALUES
(1, 1, 1, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO A
(2, 1, 2, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO B
(3, 1, 3, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- SEGUNDO A
(4, 1, 4, 'NOCHE', 'PUBLICADO', 35, 10, TRUE);  -- TERCERO A

-- ============================================
-- ADMINISTRACIÓN DE EMPRESAS (gestion_plan_id = 2)
-- ============================================

INSERT INTO paralelos_gestion (id, gestion_plan_id, paralelo_id, turno, estado, cupo_maximo, cupo_minimo, activo) VALUES
(5, 2, 5, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO A
(6, 2, 6, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO B
(7, 2, 7, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO C
(8, 2, 8, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- SEGUNDO A
(9, 2, 9, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- SEGUNDO B
(10, 2, 10, 'NOCHE', 'PUBLICADO', 35, 10, TRUE); -- TERCERO A

-- ============================================
-- CONTADURÍA GENERAL (gestion_plan_id = 3)
-- ============================================

INSERT INTO paralelos_gestion (id, gestion_plan_id, paralelo_id, turno, estado, cupo_maximo, cupo_minimo, activo) VALUES
(11, 3, 11, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO A
(12, 3, 12, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO B
(13, 3, 13, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO C
(14, 3, 14, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO D
(15, 3, 15, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- SEGUNDO A
(16, 3, 16, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- SEGUNDO B
(17, 3, 17, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- TERCERO A
(18, 3, 18, 'TARDE', 'PUBLICADO', 35, 10, TRUE);  -- TERCERO B

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 18 paralelos_gestion (Gestión 2026)
