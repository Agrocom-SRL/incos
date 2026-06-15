-- ============================================
-- VISTA BASE: vista_base_cursos_asignaturas
-- Oferta de curso + asignatura del plan (oferta_cursos + asignaturas_plan)
--
-- Mantiene curso_id como alias de oferta_cursos.id.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_asignaturas;

CREATE VIEW vista_base_cursos_asignaturas AS
SELECT
  oc.id AS curso_id,
  CONCAT('OC-', oc.id) AS curso_codigo,
  oc.asignatura_plan_id,
  ap.plan_estudio_id,
  pg.paralelo_id,
  pg.cupo_maximo AS curso_cupo_maximo,
  pg.cupo_minimo AS curso_cupo_minimo,
  ap.materia_id,
  ap.periodo_id,
  ap.horas_semanales,
  ap.creditos,
  ap.modalidad AS materia_modalidad,
  ap.orden_visualizacion AS materia_orden
FROM oferta_cursos oc
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.activo = TRUE
  AND pg.deleted_at IS NULL
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.activo = TRUE
  AND ap.deleted_at IS NULL
WHERE oc.activo = TRUE
  AND oc.deleted_at IS NULL;
