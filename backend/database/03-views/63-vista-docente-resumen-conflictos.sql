-- ============================================
-- VISTA: vista_docente_resumen_conflictos
-- Resumen de carga docente y conflictos operativos (consolidada).
--
-- Propósito:
-- - Entregar, por docente, métricas listas para el listado:
--   - total_asignaciones, total_materias, total_paralelos
--   - conflicto_curso, conflicto_horario, conflicto_aula
--
-- Reutiliza sub-vistas base:
-- - vista_base_docente_carga_resumen (59)
-- - vista_base_docente_conflicto_curso (60)
-- - vista_base_docente_conflicto_horario (61)
-- - vista_base_docente_conflicto_aula (62)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_docente_resumen_conflictos;

CREATE VIEW vista_docente_resumen_conflictos AS
SELECT
  d.id AS docente_id,
  COALESCE(carga.total_asignaciones, 0) AS total_asignaciones,
  COALESCE(carga.total_materias, 0) AS total_materias,
  COALESCE(carga.total_paralelos, 0) AS total_paralelos,
  COALESCE(curso.curso_conflictos, 0) AS conflicto_curso,
  COALESCE(horario.horario_conflictos, 0) AS conflicto_horario,
  COALESCE(aula.aula_conflictos, 0) AS conflicto_aula
FROM docentes d
LEFT JOIN vista_base_docente_carga_resumen carga ON carga.docente_id = d.id
LEFT JOIN vista_base_docente_conflicto_curso curso ON curso.docente_id = d.id
LEFT JOIN vista_base_docente_conflicto_horario horario ON horario.docente_id = d.id
LEFT JOIN vista_base_docente_conflicto_aula aula ON aula.docente_id = d.id
WHERE d.deleted_at IS NULL;
