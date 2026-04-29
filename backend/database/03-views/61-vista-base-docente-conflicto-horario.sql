-- ============================================
-- VISTA BASE: vista_base_docente_conflicto_horario
-- Conflictos por bloque horario duplicado en cursos distintos del mismo docente.
--
-- Propósito:
-- - Contar cuántos bloques horarios están ocupados por más de un curso
--   para cada docente (activo + vigente).
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
    ch.horario_id
  FROM asignaciones_docentes ad
  INNER JOIN cursos_horarios ch ON ch.curso_id = ad.curso_id
    AND ch.deleted_at IS NULL
    AND ch.activo = TRUE
  WHERE ad.deleted_at IS NULL
    AND ad.activo = TRUE
    AND ad.vigente = TRUE
    AND ad.docente_id IS NOT NULL
    AND ch.horario_id IS NOT NULL
  GROUP BY ad.docente_id, ch.horario_id
  HAVING COUNT(DISTINCT ad.curso_id) > 1
) x
GROUP BY x.docente_id;
