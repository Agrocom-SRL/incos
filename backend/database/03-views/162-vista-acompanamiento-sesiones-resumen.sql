-- ============================================
-- VISTA: vista_acompanamiento_sesiones_resumen
-- Resumen mensual de sesiones de refuerzo por carrera (módulo TUT).
--
-- Grano: una fila por (gestion_id, carrera, mes 'YYYY-MM'). Vista final
-- delgada sobre la base 161 + cadena paralelos_gestion → gestiones_planes →
-- planes_estudios → carreras (solo para resolver la carrera del paralelo).
--
-- Consumidores:
--   - AcompanamientoSesionViewRepository (backend) → GET /acompanamiento/panel
--     (sección sesiones) y GET /acompanamiento/panel/exportar (PDF).
--
-- Uso:
--   SELECT * FROM vista_acompanamiento_sesiones_resumen
--   WHERE gestion_id = ?
--   ORDER BY mes, carrera_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_acompanamiento_sesiones_resumen;

CREATE VIEW vista_acompanamiento_sesiones_resumen AS
SELECT
  sf.gestion_id        AS gestion_id,
  c.id                 AS carrera_id,
  c.codigo             AS carrera_codigo,
  c.nombre             AS carrera_nombre,
  c.color_hex          AS carrera_color_hex,
  DATE_FORMAT(sf.fecha, '%Y-%m') AS mes,
  COUNT(*)             AS sesiones_programadas,
  SUM(CASE WHEN sf.estado = 'REALIZADA' THEN 1 ELSE 0 END) AS sesiones_realizadas,
  SUM(sf.total_participantes) AS participantes,
  SUM(sf.asistieron)          AS asistencias,
  ROUND(100 * SUM(sf.asistieron) / NULLIF(SUM(sf.total_participantes), 0), 2) AS pct_asistencia
FROM vista_base_acompanamiento_sesion_fila sf
INNER JOIN paralelos_gestion pg
  ON pg.id = sf.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN gestiones_planes gp
  ON gp.id = pg.gestion_plan_id
  AND gp.deleted_at IS NULL
INNER JOIN planes_estudios pe
  ON pe.id = gp.plan_estudio_id
  AND pe.deleted_at IS NULL
INNER JOIN carreras c
  ON c.id = pe.carrera_id
  AND c.deleted_at IS NULL
GROUP BY
  sf.gestion_id, c.id, c.codigo, c.nombre, c.color_hex, DATE_FORMAT(sf.fecha, '%Y-%m');
