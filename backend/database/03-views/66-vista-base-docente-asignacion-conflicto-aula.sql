-- ============================================
-- VISTA BASE: vista_base_docente_asignacion_conflicto_aula
-- Conflicto por aula+horario (nivel asignación).
--
-- Propósito:
-- - Marcar asignaciones que comparten el mismo slot aula+horario
--   con otra asignación activa + vigente del sistema.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignacion_conflicto_aula;

CREATE VIEW vista_base_docente_asignacion_conflicto_aula AS
SELECT DISTINCT
  ad2.id AS asignacion_docente_id,
  ad2.docente_id
FROM asignaciones_docentes ad2
INNER JOIN cursos_horarios ch2 ON ch2.curso_id = ad2.curso_id
  AND ch2.deleted_at IS NULL
  AND ch2.activo = TRUE
INNER JOIN asignaciones_docentes ad3 ON ad3.id <> ad2.id
  AND ad3.deleted_at IS NULL
  AND ad3.activo = TRUE
  AND ad3.vigente = TRUE
INNER JOIN cursos_horarios ch3 ON ch3.curso_id = ad3.curso_id
  AND ch3.deleted_at IS NULL
  AND ch3.activo = TRUE
  AND ch3.horario_id = ch2.horario_id
  AND ch3.aula_id = ch2.aula_id
WHERE ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
  AND ad2.docente_id IS NOT NULL
  AND ch2.aula_id IS NOT NULL;
