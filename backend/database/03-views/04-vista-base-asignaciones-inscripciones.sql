-- ============================================
-- VISTA BASE: vista_base_asignaciones_inscripciones
-- Relación entre oferta de curso, asignación docente (opcional) y matrículas
--
-- Modelo de negocio:
-- - matriculas_materia.oferta_curso_id es el ancla estable de la matrícula.
-- - asignaciones_docentes.oferta_curso_id enlaza docente ↔ misma oferta.
-- - curso_id se mantiene como alias de oferta_cursos.id (vistas dependientes).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asignaciones_inscripciones;

CREATE VIEW vista_base_asignaciones_inscripciones AS
SELECT
  ad.id AS asignacion_docente_id,
  mm.oferta_curso_id AS curso_id,
  ad.docente_id,
  ad.vigente AS asignacion_vigente,

  mm.id AS matricula_materia_id,
  mm.inscripcion_id,
  mm.asignatura_plan_id,
  mm.estado AS matricula_estado
FROM matriculas_materia mm
LEFT JOIN asignaciones_docentes ad
  ON ad.oferta_curso_id = mm.oferta_curso_id
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.deleted_at IS NULL
WHERE mm.activo = TRUE
  AND mm.deleted_at IS NULL;
