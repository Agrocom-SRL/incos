-- ============================================
-- SEEDER: paralelos_gestion — Gestión 2026 (V2)
-- Sistema de Gestión Académica - Instituto INCOS
-- Sprint 3 — Oferta Académica (paso 1: instanciar paralelos en la gestión)
-- ============================================
-- Pre-requisitos: 16-gestiones, 19-gestiones-planes, 25-paralelos, 23-aulas
-- Siguiente: 28–30 seed-oferta-cursos-* (una por carrera)
--
-- IDs fijos: 1–18 (SIS 1–4, ADM 5–10, CON 11–18)
-- gestion_plan_id: 1=SIS, 2=ADM, 3=CON
-- aula_id: aula base por paralelo (moda de horarios reales 2026)
-- turno: turno efectivo L-V; el sábado (horarios 56-60) es opcional por materia
--   y se asigna en asignacion_horarios cuando hace falta completar carga_horaria

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- SISTEMAS INFORMÁTICOS (gestion_plan_id = 1)
-- ============================================

INSERT INTO paralelos_gestion (id, gestion_plan_id, paralelo_id, aula_id, turno, estado, cupo_maximo, cupo_minimo, activo) VALUES
(1, 1, 1, 4, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),   -- PRIMERO A → LAB-4
(2, 1, 2, 1, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),   -- PRIMERO B → LAB-1
(3, 1, 3, 3, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),   -- SEGUNDO A → LAB-3
(4, 1, 4, 7, 'NOCHE', 'PUBLICADO', 35, 10, TRUE);   -- TERCERO A → LAB-5

-- ============================================
-- ADMINISTRACIÓN DE EMPRESAS (gestion_plan_id = 2)
-- ============================================

INSERT INTO paralelos_gestion (id, gestion_plan_id, paralelo_id, aula_id, turno, estado, cupo_maximo, cupo_minimo, activo) VALUES
(5, 2, 5, 3, 'TARDE', 'PUBLICADO', 35, 10, TRUE),   -- PRIMERO A → LAB-3
(6, 2, 6, 13, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO B → AULA-7
(7, 2, 7, 10, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO C → AULA-3
(8, 2, 8, 11, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- SEGUNDO A → AULA-4
(9, 2, 9, 8, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),   -- SEGUNDO B → AULA-1
(10, 2, 10, 9, 'NOCHE', 'PUBLICADO', 35, 10, TRUE); -- TERCERO A → AULA-2

-- ============================================
-- CONTADURÍA GENERAL (gestion_plan_id = 3)
-- ============================================

INSERT INTO paralelos_gestion (id, gestion_plan_id, paralelo_id, aula_id, turno, estado, cupo_maximo, cupo_minimo, activo) VALUES
(11, 3, 11, 10, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO A → AULA-3
(12, 3, 12, 9, 'TARDE', 'PUBLICADO', 35, 10, TRUE),   -- PRIMERO B → AULA-2
(13, 3, 13, 12, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO C → AULA-5
(14, 3, 14, 11, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),  -- PRIMERO D → AULA-4
(15, 3, 15, 8, 'TARDE', 'PUBLICADO', 35, 10, TRUE),   -- SEGUNDO A → AULA-1
(16, 3, 16, 5, 'NOCHE', 'PUBLICADO', 35, 10, TRUE),   -- SEGUNDO B → AULA-6
(17, 3, 17, 12, 'TARDE', 'PUBLICADO', 35, 10, TRUE),  -- TERCERO A → AULA-5
(18, 3, 18, 6, 'TARDE', 'PUBLICADO', 35, 10, TRUE);   -- TERCERO B → AULA-8

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 18 paralelos_gestion (Gestión 2026)
