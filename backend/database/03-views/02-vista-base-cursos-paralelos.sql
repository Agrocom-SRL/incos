-- ============================================
-- VISTA BASE: vista_base_cursos_paralelos
-- Relación entre cursos y paralelos
-- 
-- Propósito: Vista base que une cursos + paralelos (2 tablas)
-- Reutilizable para construir vistas más complejas
-- 
-- Relaciones según schemas:
-- - cursos.paralelo_id → paralelos.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_paralelos;

CREATE VIEW vista_base_cursos_paralelos AS
SELECT 
  c.id AS curso_id,
  c.codigo AS curso_codigo,
  c.cupo_maximo AS curso_cupo_maximo,
  c.cupo_minimo AS curso_cupo_minimo,
  c.paralelo_id
FROM cursos c
INNER JOIN paralelos p ON p.id = c.paralelo_id
  AND p.activo = TRUE 
  AND p.deleted_at IS NULL
WHERE c.activo = TRUE 
  AND c.deleted_at IS NULL;
