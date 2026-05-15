-- ============================================
-- VISTA BASE: vista_base_asignaciones_inscripciones
-- Relación entre asignaciones docentes y matrículas de materia
--
-- Propósito:
-- Vista base que une asignaciones_docentes + matriculas_materia.
-- Reutilizable para construir vistas más complejas.
--
-- Ajuste al nuevo schema:
-- - inscripciones_materias se reemplaza por matriculas_materia.
-- - inscripcion_materia_id se reemplaza por matricula_materia_id.
-- - materia_estado se reemplaza por matricula_estado.
--
-- IMPORTANTE:
-- Esta vista base NO filtra estados académicos como ABANDONO o RETIRADO.
-- La razón es que otras vistas de reporte necesitan contar inscritos, efectivos,
-- abandonos, retirados y reprobados desde la misma base.
--
-- Relaciones según nuevo schema:
-- - matriculas_materia.asignacion_docente_id → asignaciones_docentes.id
-- - matriculas_materia.inscripcion_id → inscripciones.id
-- - matriculas_materia.asignatura_plan_id → asignaturas_plan.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asignaciones_inscripciones;

CREATE VIEW vista_base_asignaciones_inscripciones AS
SELECT
  ad.id AS asignacion_docente_id,
  ad.curso_id,
  ad.docente_id,
  ad.vigente AS asignacion_vigente,

  mm.id AS matricula_materia_id,
  mm.inscripcion_id,
  mm.asignatura_plan_id,
  mm.estado AS matricula_estado
FROM asignaciones_docentes ad
INNER JOIN matriculas_materia mm
  ON mm.asignacion_docente_id = ad.id
  AND mm.activo = TRUE
  AND mm.deleted_at IS NULL
WHERE ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.deleted_at IS NULL;
