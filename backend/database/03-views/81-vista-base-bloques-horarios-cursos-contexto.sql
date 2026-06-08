-- ============================================
-- VISTA BASE: vista_base_bloques_horarios_cursos_contexto
-- Bloques de asignacion_horarios con contexto académico.
--
-- Modelo de negocio:
-- - Aula: paralelos_gestion.aula_id (Oferta académica).
-- - Turno operativo: paralelos_gestion.turno (no paralelos.turno maestro).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_bloques_horarios_cursos_contexto;

CREATE VIEW vista_base_bloques_horarios_cursos_contexto AS
SELECT
  ah.id AS curso_horario_id,
  oc.id AS curso_id,
  CONCAT('OC-', oc.id) AS curso_codigo,
  doc.color_hex AS curso_color_hex,
  h.id AS horario_id,
  h.dia AS dia,
  h.hora_inicio AS hora_inicio,
  h.hora_fin AS hora_fin,
  h.turno AS turno,
  h.numero_bloque AS numero_bloque,
  ah.orden_secuencia AS orden_secuencia,
  pg.aula_id AS aula_id,
  m.id AS materia_id,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  ap.horas_semanales AS horas_plan,
  p.id AS paralelo_id,
  p.nombre AS paralelo_nombre,
  pg.turno AS paralelo_turno,
  per.nombre AS periodo_nombre,
  car.id AS carrera_id,
  car.nombre AS carrera_nombre,
  car.codigo AS carrera_codigo,
  car.color_hex AS carrera_color_hex,
  d.docente_nombre AS docente_nombre
FROM asignacion_horarios ah
INNER JOIN asignaciones_docentes ad
  ON ad.id = ah.asignacion_docente_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN horarios h
  ON h.id = ah.horario_id
  AND h.deleted_at IS NULL
  AND h.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.deleted_at IS NULL
  AND p.activo = TRUE
LEFT JOIN periodos per ON per.id = p.periodo_id
  AND per.deleted_at IS NULL
  AND per.activo = TRUE
LEFT JOIN carreras car ON car.id = p.carrera_id
  AND car.deleted_at IS NULL
  AND car.activo = TRUE
INNER JOIN asignaturas_plan ap ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = TRUE
LEFT JOIN materias m ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
  AND m.activo = TRUE
LEFT JOIN docentes doc ON doc.id = ad.docente_id AND doc.deleted_at IS NULL
LEFT JOIN vista_base_docentes_vigentes_por_curso d ON d.curso_id = oc.id
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE;
