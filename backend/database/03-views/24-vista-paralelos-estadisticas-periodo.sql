-- ============================================
-- VISTA: vista_paralelos_estadisticas_periodo
-- Paralelos activos con estadísticas por gestión y datos del periodo
--
-- Propósito: Una fila por (paralelo_id, gestion_id) con totales de inscritos y datos del periodo.
-- - Paralelos sin inscripciones: una fila con gestion_id NULL y totales 0.
-- - Paralelos con inscripciones: una fila por cada gestión con datos y una fila con gestion_id NULL
--   y totales 0 (para poder mostrar 0 cuando se consulta por una gestión sin inscripciones).
-- Reutiliza vistas base:
-- - vista_base_paralelos_estadisticas_periodo_gestion (16)
-- - vista_base_paralelos_estadisticas_periodo_sin_gestion (23)
--
-- Uso desde repositorio: filtrar por paralelo_id IN (...) y (gestion_id = ? OR gestion_id IS NULL),
-- y opcionalmente usar ROW_NUMBER para una sola fila por paralelo (preferir gestion_id = ?).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_paralelos_estadisticas_periodo;

CREATE VIEW vista_paralelos_estadisticas_periodo AS
SELECT
  bpg.paralelo_id,
  bpg.gestion_id,
  bpg.total_inscritos,
  bpg.total_hombres,
  bpg.total_mujeres,
  bpg.periodo_numero,
  bpg.periodo_nombre
FROM vista_base_paralelos_estadisticas_periodo_gestion bpg
UNION ALL
SELECT
  bpsg.paralelo_id,
  bpsg.gestion_id,
  bpsg.total_inscritos,
  bpsg.total_hombres,
  bpsg.total_mujeres,
  bpsg.periodo_numero,
  bpsg.periodo_nombre
FROM vista_base_paralelos_estadisticas_periodo_sin_gestion bpsg;
