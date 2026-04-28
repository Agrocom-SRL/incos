-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_aula
-- Conflictos de aula+horario por docente.
--
-- Propósito:
-- - Contar slots (aula_id + horario_id) donde la asignación del docente
--   colisiona con otra asignación activa/vigente en el sistema.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_conflicto_aula;

CREATE VIEW vista_base_docente_conflicto_aula AS
SELECT
  ad.docente_id,
  COUNT(DISTINCT CONCAT(ch.aula_id, ':', ch.horario_id)) AS aula_conflictos
FROM asignaciones_docentes ad
INNER JOIN cursos_horarios ch ON ch.curso_id = ad.curso_id
  AND ch.deleted_at IS NULL
  AND ch.activo = TRUE
INNER JOIN (
  SELECT
    ch2.aula_id,
    ch2.horario_id
  FROM asignaciones_docentes ad2
  INNER JOIN cursos_horarios ch2 ON ch2.curso_id = ad2.curso_id
    AND ch2.deleted_at IS NULL
    AND ch2.activo = TRUE
  WHERE ad2.deleted_at IS NULL
    AND ad2.activo = TRUE
    AND ad2.vigente = TRUE
    AND ch2.aula_id IS NOT NULL
    AND ch2.horario_id IS NOT NULL
  GROUP BY ch2.aula_id, ch2.horario_id
  HAVING COUNT(DISTINCT ad2.id) > 1
) g ON g.aula_id = ch.aula_id
  AND g.horario_id = ch.horario_id
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL
  AND ch.aula_id IS NOT NULL
  AND ch.horario_id IS NOT NULL
GROUP BY ad.docente_id;
