-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflicto_aula
-- Conflicto por aula+horario (nivel asignación).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflicto_aula;

CREATE VIEW vista_base_docente_asignacion_conflicto_aula AS
SELECT DISTINCT
  ad2.id AS asignacion_docente_id,
  ad2.docente_id
FROM asignaciones_docentes ad2
INNER JOIN asignacion_horarios ah2
  ON ah2.asignacion_docente_id = ad2.id
  AND ah2.deleted_at IS NULL
  AND ah2.activo = TRUE
INNER JOIN asignaciones_docentes ad3
  ON ad3.id <> ad2.id
  AND ad3.deleted_at IS NULL
  AND ad3.activo = TRUE
  AND ad3.vigente = TRUE
INNER JOIN asignacion_horarios ah3
  ON ah3.asignacion_docente_id = ad3.id
  AND ah3.deleted_at IS NULL
  AND ah3.activo = TRUE
  AND ah3.horario_id = ah2.horario_id
  AND ah3.aula_id = ah2.aula_id
WHERE ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
  AND ad2.docente_id IS NOT NULL
  AND ah2.aula_id IS NOT NULL;
