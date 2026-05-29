-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_aula
-- Conflictos de aula+horario por docente (asignacion_horarios).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_aula;

CREATE VIEW vista_base_docente_conflicto_aula AS
SELECT
  ad.docente_id,
  COUNT(DISTINCT CONCAT(ah.aula_id, ':', ah.horario_id)) AS aula_conflictos
FROM asignaciones_docentes ad
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
INNER JOIN (
  SELECT
    ah2.aula_id,
    ah2.horario_id
  FROM asignaciones_docentes ad2
  INNER JOIN asignacion_horarios ah2
    ON ah2.asignacion_docente_id = ad2.id
    AND ah2.deleted_at IS NULL
    AND ah2.activo = TRUE
  WHERE ad2.deleted_at IS NULL
    AND ad2.activo = TRUE
    AND ad2.vigente = TRUE
    AND ah2.aula_id IS NOT NULL
    AND ah2.horario_id IS NOT NULL
  GROUP BY ah2.aula_id, ah2.horario_id
  HAVING COUNT(DISTINCT ad2.id) > 1
) g ON g.aula_id = ah.aula_id
  AND g.horario_id = ah.horario_id
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL
  AND ah.aula_id IS NOT NULL
  AND ah.horario_id IS NOT NULL
GROUP BY ad.docente_id;
