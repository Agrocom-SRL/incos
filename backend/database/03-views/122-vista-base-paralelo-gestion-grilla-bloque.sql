-- ============================================
-- VISTA BASE: vista_base_paralelo_gestion_grilla_bloque
-- Bloques activos por paralelo_gestion para GET grilla-horario.
--
-- Modelo de negocio:
-- - Reutiliza vista_base_curso_bloques_horario (aula = paralelos_gestion.aula_id).
-- - Una fila por asignacion_horarios vigente.
--
-- Reutiliza:
-- - vista_base_curso_bloques_horario (54)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelo_gestion_grilla_bloque;

CREATE VIEW vista_base_paralelo_gestion_grilla_bloque AS
SELECT
  b.id AS asignacionHorarioId,
  oc.paralelo_gestion_id AS paraleloGestionId,
  ad.id AS asignacionDocenteId,
  ad.docente_id AS docenteId,
  b.cursoId AS ofertaCursoId,
  b.horarioId AS horarioId,
  b.dia AS dia,
  DATE_FORMAT(b.horaInicio, '%H:%i') AS horaInicio,
  DATE_FORMAT(b.horaFin, '%H:%i') AS horaFin,
  b.numeroBloque AS numeroBloque,
  pg.aula_id AS aulaBaseId,
  b.aulaId AS aulaId,
  b.aulaNombre AS aulaNombre,
  b.aulaCodigo AS aulaCodigo,
  m.sigla AS asignatura,
  TRIM(CONCAT(
    COALESCE(doc.nombres, ''),
    ' ',
    COALESCE(doc.apellido_paterno, ''),
    ' ',
    COALESCE(doc.apellido_materno, '')
  )) AS docenteNombre,
  doc.color_hex AS colorHex,
  ad.carga_horaria AS cargaHoraria,
  ap.horas_semanales AS horasPlan
FROM vista_base_curso_bloques_horario b
INNER JOIN asignacion_horarios ah
  ON ah.id = b.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
INNER JOIN asignaciones_docentes ad
  ON ad.id = ah.asignacion_docente_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = b.cursoId
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
LEFT JOIN docentes doc
  ON doc.id = ad.docente_id
  AND doc.deleted_at IS NULL;
