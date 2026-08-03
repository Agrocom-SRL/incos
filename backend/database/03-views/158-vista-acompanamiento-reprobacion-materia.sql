-- ============================================
-- VISTA: vista_acompanamiento_reprobacion_materia
-- Índice de riesgo y reprobación por materia ofertada (módulo TUT).
--
-- Grano: una fila por (gestion_id, carrera, oferta_curso). Vista final
-- delgada sobre UNA base (156 vista_base_acompanamiento_riesgo_fila);
-- el estado REPROBADO sale del caché oficial de matriculas_materia que ya
-- expone la 135/156, no se recalcula.
--
-- Consumidores:
--   - RiesgoAcademicoViewRepository (backend) → GET /acompanamiento/panel
--     (ranking de materias críticas) y GET /acompanamiento/panel/exportar.
--
-- Uso:
--   SELECT * FROM vista_acompanamiento_reprobacion_materia
--   WHERE gestion_id = ?
--   ORDER BY pct_riesgo DESC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_acompanamiento_reprobacion_materia;

CREATE VIEW vista_acompanamiento_reprobacion_materia AS
SELECT
  r.gestion_id         AS gestion_id,
  r.carrera_id         AS carrera_id,
  r.carrera_codigo     AS carrera_codigo,
  r.carrera_nombre     AS carrera_nombre,
  r.carrera_color_hex  AS carrera_color_hex,
  r.oferta_curso_id    AS oferta_curso_id,
  r.asignatura_sigla   AS asignatura_sigla,
  r.asignatura_nombre  AS asignatura_nombre,
  r.docente_nombre     AS docente_nombre,
  COUNT(*)             AS matriculados,
  SUM(r.en_riesgo)     AS en_riesgo,
  SUM(CASE WHEN r.matricula_estado = 'REPROBADO' THEN 1 ELSE 0 END) AS reprobados,
  ROUND(100 * SUM(r.en_riesgo) / NULLIF(COUNT(*), 0), 2) AS pct_riesgo,
  ROUND(
    100 * SUM(CASE WHEN r.matricula_estado = 'REPROBADO' THEN 1 ELSE 0 END)
      / NULLIF(COUNT(*), 0),
    2
  ) AS pct_reprobacion
FROM vista_base_acompanamiento_riesgo_fila r
GROUP BY
  r.gestion_id, r.carrera_id, r.carrera_codigo, r.carrera_nombre, r.carrera_color_hex,
  r.oferta_curso_id, r.asignatura_sigla, r.asignatura_nombre, r.docente_nombre;
