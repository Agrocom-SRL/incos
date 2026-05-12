-- ============================================
-- VISTA BASE: vista_base_docentes_choque_bloques_por_curso
-- Pares (docente_id, curso_id) donde el docente tiene una asignación vigente
-- en cualquier bloque (horario_id) que también usa el curso_id de referencia.
--
-- Propósito:
-- - Alimentar TeacherRepository.getDocentesConChoqueBloques(cursoId)
-- - Permite al modal de asignación de docentes detectar qué candidatos tienen
--   choque específicamente en los bloques del curso que se intenta asignar.
--
-- Semántica del par:
--   docente_id → docente ocupado
--   curso_id   → curso cuyo bloque está ocupado por ese docente (en otro curso)
--
-- Uso:
--   SELECT DISTINCT docente_id
--   FROM vista_base_docentes_choque_bloques_por_curso
--   WHERE curso_id = ?;
--
-- Tablas: asignaciones_docentes, cursos_horarios
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docentes_choque_bloques_por_curso;

CREATE VIEW vista_base_docentes_choque_bloques_por_curso AS
SELECT DISTINCT
  ad.docente_id  AS docente_id,
  ch2.curso_id   AS curso_id
FROM asignaciones_docentes ad
INNER JOIN cursos_horarios ch
  ON ch.curso_id = ad.curso_id
  AND ch.deleted_at IS NULL
  AND ch.activo = TRUE
  AND ch.horario_id IS NOT NULL
INNER JOIN cursos_horarios ch2
  ON ch2.horario_id = ch.horario_id
  AND ch2.curso_id != ad.curso_id
  AND ch2.deleted_at IS NULL
  AND ch2.activo = TRUE
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE;
