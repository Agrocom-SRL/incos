-- ============================================
-- VISTA BASE: vista_base_curso_bloques_horario
-- Bloques de horario y aula por curso (oferta / maestro), sin filtrar por docente
--
-- Propósito: Expone cursos_horarios con horario y aula para presentación en API
-- (misma forma que consultaba CourseScheduleRepository).
--
-- Reutiliza: cursos_horarios, horarios, aulas
-- Diferencia con vista_base_docente_curso_bloques_horario: no exige asignación docente.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_curso_bloques_horario;

CREATE VIEW vista_base_curso_bloques_horario AS
SELECT
  ch.id AS id,
  ch.curso_id AS cursoId,
  ch.orden_secuencia AS ordenSecuencia,
  ch.horario_id AS horarioId,
  h.nombre AS horarioNombre,
  h.dia AS dia,
  h.hora_inicio AS horaInicio,
  h.hora_fin AS horaFin,
  h.turno AS turno,
  h.numero_bloque AS numeroBloque,
  ch.aula_id AS aulaId,
  a.codigo AS aulaCodigo,
  a.nombre AS aulaNombre
FROM cursos_horarios ch
LEFT JOIN horarios h ON h.id = ch.horario_id
  AND h.deleted_at IS NULL
LEFT JOIN aulas a ON a.id = ch.aula_id
  AND a.deleted_at IS NULL
WHERE ch.deleted_at IS NULL
  AND ch.activo = TRUE;
