-- ============================================
-- VISTA BASE: vista_base_cursos_asignaturas
-- Pieza modular: cursos + asignaturas_plan (2 tablas)
--
-- Propósito: Vista que une cursos + asignaturas_plan.
-- Expone curso_id, paralelo_id, materia_id, periodo_id, horas_semanales, créditos, modalidad.
-- Reutilizable para construir vistas más complejas.
--
-- Relaciones:
-- - cursos.asignatura_plan_id → asignaturas_plan.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_asignaturas;

CREATE VIEW vista_base_cursos_asignaturas AS
SELECT
  c.id AS curso_id,
  c.codigo AS curso_codigo,
  c.paralelo_id,
  c.cupo_maximo AS curso_cupo_maximo,
  c.cupo_minimo AS curso_cupo_minimo,
  ap.materia_id,
  ap.periodo_id,
  ap.horas_semanales,
  ap.creditos,
  ap.modalidad AS materia_modalidad,
  ap.orden_visualizacion AS materia_orden
FROM cursos c
INNER JOIN asignaturas_plan ap ON ap.id = c.asignatura_plan_id
  AND ap.activo = TRUE
  AND ap.deleted_at IS NULL
WHERE c.activo = TRUE
  AND c.deleted_at IS NULL;
