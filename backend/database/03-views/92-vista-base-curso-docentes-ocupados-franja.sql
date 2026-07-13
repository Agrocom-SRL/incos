-- ============================================
-- VISTA BASE: vista_base_curso_docentes_ocupados_franja
-- (docente_id, curso_id) = docentes OCUPADOS en las franjas horario de un curso.
--
-- OJO: NO es un auto-conflicto del mismo docente (a diferencia de 36/61/65/79/91).
-- Es una verificación de DISPONIBILIDAD CRUZADA entre docentes: para un curso
-- (oferta) dado, devuelve los docentes que ya tienen una asignación vigente en
-- alguna de las mismas franjas, para advertir antes de asignarlos a ese curso.
-- Por eso, a propósito, NO exige ad2.docente_id = ad.docente_id.
--
-- Consumidor: TeacherRepository.getDocentesConChoqueBloques()
--   → GET /api/v1/docentes/conflicto-bloques?cursoId=X
--
-- Ocupación solo INTRA-gestión: la renovación de oferta copia bloques idénticos
-- entre gestiones y dos gestiones nunca corren simultáneamente; el docente solo
-- cuenta como ocupado si su asignación es de la MISMA gestión que el curso
-- (vía asignaciones_docentes.gestion_plan_id, mismo criterio que el primitivo 36).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_curso_docentes_ocupados_franja;

CREATE VIEW vista_base_curso_docentes_ocupados_franja AS
SELECT DISTINCT
  ad.docente_id AS docente_id,
  ad2.oferta_curso_id AS curso_id
FROM asignaciones_docentes ad
INNER JOIN gestiones_planes gp_a
  ON gp_a.id = ad.gestion_plan_id
  AND gp_a.deleted_at IS NULL
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
  AND ah.horario_id IS NOT NULL
INNER JOIN asignacion_horarios ah2
  ON ah2.horario_id = ah.horario_id
  AND ah2.deleted_at IS NULL
  AND ah2.activo = TRUE
INNER JOIN asignaciones_docentes ad2
  ON ad2.id = ah2.asignacion_docente_id
  AND ad2.oferta_curso_id <> ad.oferta_curso_id
  AND ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
INNER JOIN gestiones_planes gp_b
  ON gp_b.id = ad2.gestion_plan_id
  AND gp_b.gestion_id = gp_a.gestion_id
  AND gp_b.deleted_at IS NULL
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE;
