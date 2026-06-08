-- ============================================
-- VISTA BASE: vista_base_curso_bloques_horario
-- Bloques de asignacion_horarios por oferta (cursoId = oferta_curso_id)
--
-- Modelo de negocio:
-- - Aula física: solo paralelos_gestion.aula_id (sin override por bloque).
-- - Turno operativo del paralelo: paralelos_gestion.turno (horarios.turno = catálogo de franja).
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
  pg.aula_id AS aulaId,
  a_paralelo.codigo AS aulaCodigo,
  a_paralelo.nombre AS aulaNombre
FROM asignacion_horarios ah
INNER JOIN asignaciones_docentes ad
  ON ad.id = ah.asignacion_docente_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
  AND pg.activo = TRUE
LEFT JOIN horarios h ON h.id = ah.horario_id
  AND h.deleted_at IS NULL
LEFT JOIN aulas a_paralelo ON a_paralelo.id = pg.aula_id
  AND a_paralelo.deleted_at IS NULL
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE;
