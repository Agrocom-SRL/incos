-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflictos
-- Conflictos por asignación docente (consolidada).
--
-- Propósito:
-- - Exponer, por asignación, si tiene conflicto de:
--   - curso (duplicidad del mismo curso para el mismo docente)
--   - horario (mismo bloque horario con otra asignación del mismo docente)
--   - aula (mismo aula+horario con otra asignación activa/vigente del sistema)
--
-- Reutiliza:
-- - vista_base_docente_asignacion_conflicto_curso
-- - vista_base_docente_asignacion_conflicto_horario (65)
-- - vista_base_docente_asignacion_conflicto_aula (66)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflictos;

CREATE VIEW vista_base_docente_asignacion_conflictos AS
SELECT
  ad.id AS asignacion_docente_id,
  ad.docente_id,
  CASE WHEN c.asignacion_docente_id IS NOT NULL THEN TRUE ELSE FALSE END AS conflicto_curso,
  CASE WHEN h.asignacion_docente_id IS NOT NULL THEN TRUE ELSE FALSE END AS conflicto_horario,
  CASE WHEN a.asignacion_docente_id IS NOT NULL THEN TRUE ELSE FALSE END AS conflicto_aula
FROM asignaciones_docentes ad
LEFT JOIN vista_base_docente_asignacion_conflicto_curso c
  ON c.asignacion_docente_id = ad.id
LEFT JOIN vista_base_docente_asignacion_conflicto_horario h
  ON h.asignacion_docente_id = ad.id
LEFT JOIN vista_base_docente_asignacion_conflicto_aula a
  ON a.asignacion_docente_id = ad.id
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
  AND ad.docente_id IS NOT NULL;
