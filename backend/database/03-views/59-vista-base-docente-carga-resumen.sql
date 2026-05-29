-- ============================================
-- VISTA BASE: vista_base_docente_carga_resumen
-- Carga académica agregada por docente (oferta_cursos).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_carga_resumen;

CREATE VIEW vista_base_docente_carga_resumen AS
SELECT
  ad.docente_id,
  COUNT(DISTINCT ad.id) AS total_asignaciones,
  COUNT(DISTINCT ap.materia_id) AS total_materias,
  COUNT(DISTINCT pg.paralelo_id) AS total_paralelos
FROM asignaciones_docentes ad
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = TRUE
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL
GROUP BY ad.docente_id;
