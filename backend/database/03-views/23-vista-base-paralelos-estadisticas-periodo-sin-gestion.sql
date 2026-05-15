-- ============================================
-- VISTA BASE: vista_base_paralelos_estadisticas_periodo_sin_gestion
-- Fila fallback por paralelo con gestión NULL.
--
-- Propósito:
-- - Para paralelos que sí tienen inscripciones en alguna gestión,
--   exponer una fila adicional con gestion_id NULL y totales 0.
-- - Esta fila permite devolver 0 al consultar una gestión sin inscripciones
--   para ese paralelo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelos_estadisticas_periodo_sin_gestion;

CREATE VIEW vista_base_paralelos_estadisticas_periodo_sin_gestion AS
SELECT
  p.id AS paralelo_id,
  NULL AS gestion_id,
  0 AS total_inscritos,
  0 AS total_hombres,
  0 AS total_mujeres,
  per.numero AS periodo_numero,
  per.nombre AS periodo_nombre
FROM paralelos p
INNER JOIN vista_estadisticas_paralelos_por_gestion v 
  ON v.paralelo_id = p.id
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.activo = TRUE
  AND per.deleted_at IS NULL
WHERE p.activo = TRUE
  AND p.deleted_at IS NULL
GROUP BY 
  p.id, 
  per.id, 
  per.numero, 
  per.nombre;
