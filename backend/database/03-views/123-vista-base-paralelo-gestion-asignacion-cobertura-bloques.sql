-- ============================================
-- VISTA BASE: vista_base_paralelo_gestion_asignacion_cobertura_bloques
-- Cobertura de bloques vs carga del plan de estudios (asignaturas_plan.horas_semanales).
-- En INCOS 1 «hora» ministerial = 1 bloque de 45 min. ad.carga_horaria solo respaldo si el plan no tiene valor.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelo_gestion_asignacion_cobertura_bloques;

CREATE VIEW vista_base_paralelo_gestion_asignacion_cobertura_bloques AS
SELECT
  oc.paralelo_gestion_id AS paraleloGestionId,
  ad.id AS asignacionDocenteId,
  m.sigla AS asignatura,
  COALESCE(ap.horas_semanales, ad.carga_horaria, 0) AS horasRequeridas,
  COUNT(ah.id) AS bloquesAsignados,
  ap.orden_visualizacion AS ordenVisualizacion
FROM asignaciones_docentes ad
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
LEFT JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
GROUP BY
  oc.paralelo_gestion_id,
  ad.id,
  m.sigla,
  ad.carga_horaria,
  ap.horas_semanales,
  ap.orden_visualizacion;
