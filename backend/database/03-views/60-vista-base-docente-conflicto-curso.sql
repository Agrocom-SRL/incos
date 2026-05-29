-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_curso
-- Conflictos por duplicidad de oferta del mismo docente.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_curso;

CREATE VIEW vista_base_docente_conflicto_curso AS
SELECT
  x.docente_id,
  COUNT(*) AS curso_conflictos
FROM (
  SELECT
    ad.docente_id,
    ad.oferta_curso_id
  FROM asignaciones_docentes ad
  WHERE ad.deleted_at IS NULL
    AND ad.activo = TRUE
    AND ad.vigente = TRUE
    AND ad.docente_id IS NOT NULL
    AND ad.oferta_curso_id IS NOT NULL
  GROUP BY ad.docente_id, ad.oferta_curso_id
  HAVING COUNT(*) > 1
) x
GROUP BY x.docente_id;
