-- ============================================
-- VISTA: vista_catalogo_cursos_oferta_docente
-- Catálogo de cursos de la oferta con plan de estudios, paralelo, periodo y materia
--
-- Propósito: Reemplaza consultas embebidas en CourseRepository para listados
-- por plan_estudio_id o por paralelo_id (UI docente / asignación).
--
-- Reutiliza: vista_base_cursos_asignaturas + materias
--
-- Uso:
-- SELECT id, codigo, paraleloId, asignaturaPlanId FROM vista_catalogo_cursos_oferta_docente
--   WHERE planEstudioId = ? ORDER BY codigo;
-- SELECT * FROM vista_catalogo_cursos_oferta_docente WHERE paraleloId = ?
--   ORDER BY ordenVisualizacion ASC, codigo ASC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_catalogo_cursos_oferta_docente;

CREATE VIEW vista_catalogo_cursos_oferta_docente AS
SELECT
  vca.curso_id AS id,
  vca.curso_codigo AS codigo,
  vca.paralelo_id AS paraleloId,
  vca.asignatura_plan_id AS asignaturaPlanId,
  vca.plan_estudio_id AS planEstudioId,
  vca.periodo_id AS periodoId,
  vca.materia_orden AS ordenVisualizacion,
  m.nombre AS materiaNombre,
  m.sigla AS materiaSigla
FROM vista_base_cursos_asignaturas vca
LEFT JOIN materias m ON m.id = vca.materia_id
  AND m.deleted_at IS NULL;
