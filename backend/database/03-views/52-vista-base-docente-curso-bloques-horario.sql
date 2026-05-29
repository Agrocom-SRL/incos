-- ============================================
-- VISTA BASE: vista_base_docente_curso_bloques_horario
-- Bloques de asignacion_horarios por oferta asignada al docente (vigente)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_curso_bloques_horario;

CREATE VIEW vista_base_docente_curso_bloques_horario AS
SELECT
  ad.docente_id AS docente_id,
  CONCAT('OC-', oc.id) AS curso_codigo,
  doc.color_hex AS curso_color_hex,
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
  a.categoria AS aula_categoria
FROM asignaciones_docentes ad
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
LEFT JOIN paralelos p ON p.id = pg.paralelo_id AND p.deleted_at IS NULL
LEFT JOIN docentes doc ON doc.id = ad.docente_id AND doc.deleted_at IS NULL
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL
  AND ah.activo = TRUE
LEFT JOIN horarios h ON h.id = ah.horario_id AND h.deleted_at IS NULL
LEFT JOIN aulas a ON a.id = ah.aula_id AND a.deleted_at IS NULL
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE;
