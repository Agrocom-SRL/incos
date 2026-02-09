-- ============================================
-- VISTA: vista_paralelos_estadisticas_periodo
-- Paralelos activos con estadísticas por gestión y datos del periodo
--
-- Propósito: Una fila por (paralelo_id, gestion_id) con totales de inscritos y datos del periodo.
-- - Paralelos sin inscripciones: una fila con gestion_id NULL y totales 0.
-- - Paralelos con inscripciones: una fila por cada gestión con datos y una fila con gestion_id NULL
--   y totales 0 (para poder mostrar 0 cuando se consulta por una gestión sin inscripciones).
-- Reutiliza vista_estadisticas_paralelos_por_gestion y tabla periodos.
--
-- Uso desde repositorio: filtrar por paralelo_id IN (...) y (gestion_id = ? OR gestion_id IS NULL),
-- y opcionalmente usar ROW_NUMBER para una sola fila por paralelo (preferir gestion_id = ?).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_paralelos_estadisticas_periodo;

CREATE VIEW vista_paralelos_estadisticas_periodo AS
-- Filas con estadísticas por gestión (o NULL si el paralelo no tiene inscripciones)
SELECT
  p.id AS paralelo_id,
  v.gestion_id,
  COALESCE(v.total_inscritos, 0) AS total_inscritos,
  COALESCE(v.total_hombres, 0) AS total_hombres,
  COALESCE(v.total_mujeres, 0) AS total_mujeres,
  per.numero AS periodo_numero,
  per.nombre AS periodo_nombre
FROM paralelos p
LEFT JOIN vista_estadisticas_paralelos_por_gestion v ON v.paralelo_id = p.id
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.activo = TRUE
  AND per.deleted_at IS NULL
WHERE p.activo = TRUE
  AND p.deleted_at IS NULL
UNION ALL
-- Una fila por paralelo que sí tiene inscripciones en alguna gestión: gestion_id NULL, totales 0
-- (para que al consultar por una gestión sin inscripciones se devuelva esa fila)
SELECT
  p.id AS paralelo_id,
  NULL AS gestion_id,
  0 AS total_inscritos,
  0 AS total_hombres,
  0 AS total_mujeres,
  per.numero AS periodo_numero,
  per.nombre AS periodo_nombre
FROM paralelos p
INNER JOIN vista_estadisticas_paralelos_por_gestion v ON v.paralelo_id = p.id
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.activo = TRUE
  AND per.deleted_at IS NULL
WHERE p.activo = TRUE
  AND p.deleted_at IS NULL
GROUP BY p.id, per.id, per.numero, per.nombre;
