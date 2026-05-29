-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_horario
-- Conflictos por bloque horario duplicado en ofertas distintas del mismo docente.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_horario;

CREATE VIEW vista_base_docente_conflicto_horario AS
SELECT
  x.docente_id,
  COUNT(*) AS horario_conflictos
FROM (
  SELECT
    ad.docente_id,
    ah.horario_id
  FROM asignaciones_docentes ad
  INNER JOIN asignacion_horarios ah
    ON ah.asignacion_docente_id = ad.id
    AND ah.deleted_at IS NULL
    AND ah.activo = TRUE
  WHERE ad.deleted_at IS NULL
    AND ad.activo = TRUE
    AND ad.vigente = TRUE
    AND ad.docente_id IS NOT NULL
    AND ah.horario_id IS NOT NULL
  GROUP BY ad.docente_id, ah.horario_id
  HAVING COUNT(DISTINCT ad.oferta_curso_id) > 1
) x
GROUP BY x.docente_id;
