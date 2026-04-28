-- ============================================
-- VISTA BASE: vista_base_docente_carga_resumen
-- Carga académica agregada por docente.
--
-- Propósito:
-- - Exponer métricas base de carga para listados de docentes:
--   total_asignaciones, total_materias, total_paralelos.
--
-- Reutiliza:
-- - asignaciones_docentes
-- - cursos
-- - asignaturas_plan
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_carga_resumen;

CREATE VIEW vista_base_docente_carga_resumen AS
SELECT
  ad.docente_id,
  COUNT(DISTINCT ad.id) AS total_asignaciones,
  COUNT(DISTINCT ap.materia_id) AS total_materias,
  COUNT(DISTINCT c.paralelo_id) AS total_paralelos
FROM asignaciones_docentes ad
INNER JOIN cursos c ON c.id = ad.curso_id
  AND c.deleted_at IS NULL
  AND c.activo = TRUE
INNER JOIN asignaturas_plan ap ON ap.id = c.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = TRUE
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL
GROUP BY ad.docente_id;
