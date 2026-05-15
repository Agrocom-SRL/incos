-- ============================================
-- VISTA BASE: vista_base_paralelos_estadisticas_periodo_gestion
-- Paralelos activos con estadísticas por gestión y datos del periodo.
--
-- Propósito:
-- - Exponer una fila por (paralelo_id, gestion_id) con:
--   total_inscritos, total_hombres, total_mujeres y datos del periodo.
-- - Si un paralelo no tiene inscripciones, se devuelve una fila con
--   gestion_id NULL y totales en 0 por el LEFT JOIN.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelos_estadisticas_periodo_gestion;

CREATE VIEW vista_base_paralelos_estadisticas_periodo_gestion AS
SELECT
  p.id AS paralelo_id,
  v.gestion_id,
  COALESCE(v.total_inscritos, 0) AS total_inscritos,
  COALESCE(v.total_hombres, 0) AS total_hombres,
  COALESCE(v.total_mujeres, 0) AS total_mujeres,
  per.numero AS periodo_numero,
  per.nombre AS periodo_nombre
FROM paralelos p
LEFT JOIN vista_estadisticas_paralelos_por_gestion v 
  ON v.paralelo_id = p.id
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.activo = TRUE
  AND per.deleted_at IS NULL
WHERE p.activo = TRUE
  AND p.deleted_at IS NULL;
