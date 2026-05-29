-- ============================================
-- VISTA BASE: vista_base_curso_bloques_horario
-- Bloques de asignacion_horarios por oferta (cursoId = oferta_curso_id)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_curso_bloques_horario;

CREATE VIEW vista_base_curso_bloques_horario AS
SELECT
  ah.id AS id,
  ad.oferta_curso_id AS cursoId,
  ah.orden_secuencia AS ordenSecuencia,
  ah.horario_id AS horarioId,
  h.nombre AS horarioNombre,
  h.dia AS dia,
  h.hora_inicio AS horaInicio,
  h.hora_fin AS horaFin,
  h.turno AS turno,
  h.numero_bloque AS numeroBloque,
  ah.aula_id AS aulaId,
  a.codigo AS aulaCodigo,
  a.nombre AS aulaNombre
FROM asignacion_horarios ah
INNER JOIN asignaciones_docentes ad
  ON ad.id = ah.asignacion_docente_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
LEFT JOIN horarios h ON h.id = ah.horario_id
  AND h.deleted_at IS NULL
LEFT JOIN aulas a ON a.id = ah.aula_id
  AND a.deleted_at IS NULL
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE;
