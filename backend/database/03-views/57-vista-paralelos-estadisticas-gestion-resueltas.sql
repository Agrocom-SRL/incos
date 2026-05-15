-- ============================================
-- VISTA: vista_paralelos_estadisticas_gestion_resueltas
-- Estadísticas de inscritos por paralelo para cada gestión académica.
--
-- Propósito:
-- - Resolver en SQL la selección final usada por asignación docente.
-- - Devuelve una fila por (paralelo_id, gestion_id).
-- - Si no hay inscripciones para esa gestión, los totales se devuelven en 0.
--
-- Reutiliza:
-- - vista_paralelos_estadisticas_periodo
-- - vista_estadisticas_paralelos_por_gestion
-- - gestiones
--
-- Uso:
-- SELECT *
-- FROM vista_paralelos_estadisticas_gestion_resueltas
-- WHERE gestion_id = 2 AND paralelo_id IN (11,12,13);
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_paralelos_estadisticas_gestion_resueltas;

CREATE VIEW vista_paralelos_estadisticas_gestion_resueltas AS
SELECT
  bp.paralelo_id,
  g.id AS gestion_id,

  COALESCE(v.total_inscritos, 0) AS total_inscritos,
  COALESCE(v.total_hombres, 0) AS total_hombres,
  COALESCE(v.total_mujeres, 0) AS total_mujeres,

  bp.periodo_numero,
  bp.periodo_nombre

FROM (
  SELECT DISTINCT
    vpep.paralelo_id,
    vpep.periodo_numero,
    vpep.periodo_nombre
  FROM vista_paralelos_estadisticas_periodo vpep
) bp

CROSS JOIN gestiones g

LEFT JOIN vista_estadisticas_paralelos_por_gestion v
  ON v.paralelo_id = bp.paralelo_id
  AND v.gestion_id = g.id

WHERE g.deleted_at IS NULL
  AND g.activo = TRUE;