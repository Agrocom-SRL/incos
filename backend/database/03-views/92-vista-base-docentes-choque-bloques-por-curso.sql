-- ============================================
-- VISTA BASE: vista_base_docentes_choque_bloques_por_curso
-- Pares (docente_id, curso_id) con choque de bloques horario.
-- curso_id = oferta del bloque en conflicto.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docentes_choque_bloques_por_curso;

CREATE VIEW vista_base_docentes_choque_bloques_por_curso AS
SELECT DISTINCT
  ad.docente_id AS docente_id,
  ad2.oferta_curso_id AS curso_id
FROM asignaciones_docentes ad
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
  AND ah.horario_id IS NOT NULL
INNER JOIN asignacion_horarios ah2
  ON ah2.horario_id = ah.horario_id
  AND ah2.deleted_at IS NULL
  AND ah2.activo = TRUE
INNER JOIN asignaciones_docentes ad2
  ON ad2.id = ah2.asignacion_docente_id
  AND ad2.oferta_curso_id <> ad.oferta_curso_id
  AND ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE;
