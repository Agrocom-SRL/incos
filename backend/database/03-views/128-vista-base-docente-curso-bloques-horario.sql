-- ============================================
-- VISTA BASE: vista_base_docente_curso_bloques_horario
-- Bloques de asignacion_horarios por oferta asignada al docente (vigente).
--
-- Requiere desplegar antes:
--   130-vista-base-docente-bloque-conflicto-horario.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_curso_bloques_horario;

CREATE VIEW vista_base_docente_curso_bloques_horario AS
SELECT
  ad.docente_id AS docente_id,
  oc.id AS oferta_curso_id,
  pg.id AS paralelo_gestion_id,
  pg.turno AS paralelo_turno,
  ad.id AS asignacion_docente_id,
  ah.id AS asignacion_horario_id,
  ah.horario_id,
  ah.aula_id,
  gp.id AS gestion_plan_id,
  gp.gestion_id,
  CONCAT('OC-', oc.id) AS curso_codigo,
  doc.color_hex AS curso_color_hex,
  NULLIF(TRIM(m.sigla), '') AS materia_sigla,
  m.nombre AS materia_nombre,
  c.nombre AS carrera_nombre,
  ah.orden_secuencia,
  h.dia,
  h.hora_inicio,
  h.hora_fin,
  h.nombre AS bloque_nombre,
  h.tipo_horario,
  h.turno AS horario_turno,
  p.nombre AS paralelo_nombre,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre,
  a.categoria AS aula_categoria,
  CASE WHEN ch.asignacion_horario_id IS NOT NULL THEN 1 ELSE 0 END AS tiene_conflicto_horario
FROM asignaciones_docentes ad
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN gestiones_planes gp
  ON gp.id = ad.gestion_plan_id
  AND gp.deleted_at IS NULL
  AND gp.activo = TRUE
LEFT JOIN paralelos p ON p.id = pg.paralelo_id AND p.deleted_at IS NULL
LEFT JOIN docentes doc ON doc.id = ad.docente_id AND doc.deleted_at IS NULL
LEFT JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
LEFT JOIN planes_estudios pe
  ON pe.id = ap.plan_estudio_id
  AND pe.deleted_at IS NULL
LEFT JOIN carreras c
  ON c.id = pe.carrera_id
  AND c.deleted_at IS NULL
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
LEFT JOIN vista_base_docente_bloque_conflicto_horario ch
  ON ch.asignacion_horario_id = ah.id
  AND ch.docente_id = ad.docente_id
  AND ch.gestion_id = gp.gestion_id
LEFT JOIN horarios h ON h.id = ah.horario_id AND h.deleted_at IS NULL
LEFT JOIN aulas a ON a.id = ah.aula_id AND a.deleted_at IS NULL
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE;
