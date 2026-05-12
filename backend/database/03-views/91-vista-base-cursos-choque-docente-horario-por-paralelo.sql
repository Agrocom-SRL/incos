-- ============================================
-- VISTA BASE: vista_base_cursos_choque_docente_horario_por_paralelo
-- Cursos que tienen choque de horario docente: el docente asignado al curso comparte
-- la misma franja horaria (horario_id) con otro curso distinto al que también está asignado.
--
-- Propósito:
-- - Alimentar ParallelRepository.obtenerCursoIdsChoqueDocenteHorarioPorParalelo()
-- - Reutilizable en dashboard y vistas de estado de paralelo
--
-- Devuelve: paralelo_id, curso_id (un par por cada curso conflictivo)
-- Uso:
--   SELECT curso_id FROM vista_base_cursos_choque_docente_horario_por_paralelo
--     WHERE paralelo_id = ?;
--
-- Tablas: cursos, asignaciones_docentes, cursos_horarios
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_choque_docente_horario_por_paralelo;

CREATE VIEW vista_base_cursos_choque_docente_horario_por_paralelo AS
SELECT DISTINCT
  c1.paralelo_id AS paralelo_id,
  c1.id          AS curso_id
FROM cursos c1
INNER JOIN asignaciones_docentes ad1
  ON ad1.curso_id = c1.id
  AND ad1.deleted_at IS NULL
  AND ad1.activo = TRUE
  AND ad1.vigente = TRUE
  AND ad1.docente_id IS NOT NULL
INNER JOIN cursos_horarios ch1
  ON ch1.curso_id = c1.id
  AND ch1.deleted_at IS NULL
  AND ch1.activo = TRUE
  AND ch1.horario_id IS NOT NULL
INNER JOIN asignaciones_docentes ad2
  ON ad2.docente_id = ad1.docente_id
  AND ad2.id <> ad1.id
  AND ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
  AND ad2.docente_id IS NOT NULL
INNER JOIN cursos_horarios ch2
  ON ch2.curso_id = ad2.curso_id
  AND ch2.horario_id = ch1.horario_id
  AND ch2.deleted_at IS NULL
  AND ch2.activo = TRUE
WHERE c1.deleted_at IS NULL
  AND c1.activo = TRUE;
