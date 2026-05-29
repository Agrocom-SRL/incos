-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflicto_curso
-- Conflicto por oferta duplicada (nivel asignación).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflicto_curso;

CREATE VIEW vista_base_docente_asignacion_conflicto_curso AS
SELECT
  ad.id AS asignacion_docente_id,
  ad.docente_id
FROM asignaciones_docentes ad
INNER JOIN (
  SELECT
    docente_id,
    oferta_curso_id
  FROM asignaciones_docentes
  WHERE deleted_at IS NULL
    AND activo = TRUE
    AND vigente = TRUE
    AND docente_id IS NOT NULL
    AND oferta_curso_id IS NOT NULL
  GROUP BY docente_id, oferta_curso_id
  HAVING COUNT(*) > 1
) dup ON dup.docente_id = ad.docente_id
  AND dup.oferta_curso_id = ad.oferta_curso_id
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL;
