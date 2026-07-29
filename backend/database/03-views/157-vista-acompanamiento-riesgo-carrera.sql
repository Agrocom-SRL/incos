-- ============================================
-- VISTA: vista_acompanamiento_riesgo_carrera
-- Agregado de riesgo pedagógico por gestión × carrera (módulo TUT).
--
-- Grano: una fila por (gestion_id, carrera). Vista final delgada sobre UNA
-- base (156 vista_base_acompanamiento_riesgo_fila); no reescribe la cadena
-- de notas ni el cálculo del flag en_riesgo.
--
-- Consumidores:
--   - RiesgoAcademicoViewRepository (backend) → GET /acompanamiento/panel
--     (stat-cards por carrera) y GET /acompanamiento/panel/exportar (PDF).
--
-- Uso:
--   SELECT * FROM vista_acompanamiento_riesgo_carrera
--   WHERE gestion_id = ?
--   ORDER BY carrera_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_acompanamiento_riesgo_carrera;

CREATE VIEW vista_acompanamiento_riesgo_carrera AS
SELECT
  r.gestion_id         AS gestion_id,
  r.carrera_id         AS carrera_id,
  r.carrera_codigo     AS carrera_codigo,
  r.carrera_nombre     AS carrera_nombre,
  r.carrera_color_hex  AS carrera_color_hex,
  COUNT(*)             AS total_matriculas_materia,
  SUM(r.en_riesgo)     AS matriculas_en_riesgo,
  COUNT(DISTINCT r.estudiante_id) AS total_estudiantes,
  COUNT(DISTINCT CASE WHEN r.en_riesgo = 1 THEN r.estudiante_id END) AS estudiantes_en_riesgo,
  ROUND(
    100 * COUNT(DISTINCT CASE WHEN r.en_riesgo = 1 THEN r.estudiante_id END)
      / NULLIF(COUNT(DISTINCT r.estudiante_id), 0),
    2
  ) AS pct_estudiantes_riesgo
FROM vista_base_acompanamiento_riesgo_fila r
GROUP BY
  r.gestion_id, r.carrera_id, r.carrera_codigo, r.carrera_nombre, r.carrera_color_hex;
