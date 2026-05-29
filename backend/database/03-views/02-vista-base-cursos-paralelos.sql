-- ============================================
-- VISTA BASE: vista_base_cursos_paralelos
-- Oferta de curso por paralelo maestro (tabla oferta_cursos + paralelos_gestion)
--
-- Mantiene el alias curso_id para vistas y reportes que ya consumían esta pieza.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_paralelos;

CREATE VIEW vista_base_cursos_paralelos AS
SELECT
  oc.id AS curso_id,
  CONCAT('OC-', oc.id) AS curso_codigo,
  pg.cupo_maximo AS curso_cupo_maximo,
  pg.cupo_minimo AS curso_cupo_minimo,
  pg.paralelo_id
FROM oferta_cursos oc
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.activo = TRUE
  AND pg.deleted_at IS NULL
INNER JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
WHERE oc.activo = TRUE
  AND oc.deleted_at IS NULL;
