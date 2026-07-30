-- ============================================
-- VISTA: vista_desercion_carrera_gestion
-- Agregado de deserción estudiantil por gestión × carrera (ítem ACA
-- `/academico/avance`, pestaña Deserción — REP disuelto, 2026-07-29).
--
-- Grano: una fila por (gestion_id, carrera). Vista final delgada sobre UNA
-- base (172 vista_base_desercion_matricula_fila); no reescribe la cadena de
-- matrícula ni el flag es_desercion. ESPEJO ESTRUCTURAL de la 157
-- (vista_acompanamiento_riesgo_carrera) con consumidor distinto justificado:
-- métrica institucional de abandono consumado (histórica, grano ANUAL), no
-- riesgo pedagógico por notas de la gestión vigente.
--
-- Un estudiante cuenta como desertor de la (gestión, carrera) si tiene AL
-- MENOS una matrícula de materia en estado ABANDONO/RETIRADO en esa gestión.
--
-- Consumidores:
--   - DesercionViewRepository → GetDesercionUseCase (stat-cards por carrera de
--     GET /desercion) y ExportDesercionExcelUseCase (tabla resumen del Excel).
--
-- Orden de despliegue: después de 172.
--
-- Uso:
--   SELECT * FROM vista_desercion_carrera_gestion
--   [WHERE gestion_id = ?]
--   ORDER BY gestion_anio DESC, carrera_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_desercion_carrera_gestion;

CREATE VIEW vista_desercion_carrera_gestion AS
SELECT
  f.gestion_id         AS gestion_id,
  f.gestion_anio       AS gestion_anio,
  f.gestion_nombre     AS gestion_nombre,
  f.carrera_id         AS carrera_id,
  f.carrera_codigo     AS carrera_codigo,
  f.carrera_nombre     AS carrera_nombre,
  f.carrera_color_hex  AS carrera_color_hex,
  COUNT(*)             AS total_matriculas_materia,
  SUM(f.es_desercion)  AS matriculas_desercion,
  SUM(CASE WHEN f.estado = 'ABANDONO' THEN 1 ELSE 0 END) AS matriculas_abandono,
  SUM(CASE WHEN f.estado = 'RETIRADO' THEN 1 ELSE 0 END) AS matriculas_retiro,
  COUNT(DISTINCT f.estudiante_id) AS total_estudiantes,
  COUNT(DISTINCT CASE WHEN f.es_desercion = 1 THEN f.estudiante_id END) AS estudiantes_desercion,
  ROUND(
    100 * COUNT(DISTINCT CASE WHEN f.es_desercion = 1 THEN f.estudiante_id END)
      / NULLIF(COUNT(DISTINCT f.estudiante_id), 0),
    2
  ) AS pct_estudiantes_desercion
FROM vista_base_desercion_matricula_fila f
GROUP BY
  f.gestion_id, f.gestion_anio, f.gestion_nombre,
  f.carrera_id, f.carrera_codigo, f.carrera_nombre, f.carrera_color_hex;
