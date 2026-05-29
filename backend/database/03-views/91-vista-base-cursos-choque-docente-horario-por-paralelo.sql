-- ============================================
-- VISTA BASE: vista_base_cursos_choque_docente_horario_por_paralelo
-- Ofertas con choque de horario del docente asignado.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_choque_docente_horario_por_paralelo;

CREATE VIEW vista_base_cursos_choque_docente_horario_por_paralelo AS
SELECT DISTINCT
  pg.paralelo_id AS paralelo_id,
  oc1.id         AS curso_id
FROM oferta_cursos oc1
INNER JOIN paralelos_gestion pg
  ON pg.id = oc1.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN asignaciones_docentes ad1
  ON ad1.oferta_curso_id = oc1.id
  AND ad1.deleted_at IS NULL
  AND ad1.activo = TRUE
  AND ad1.vigente = TRUE
  AND ad1.docente_id IS NOT NULL
INNER JOIN asignacion_horarios ah1
  ON ah1.asignacion_docente_id = ad1.id
  AND ah1.deleted_at IS NULL
  AND ah1.activo = TRUE
  AND ah1.horario_id IS NOT NULL
INNER JOIN asignaciones_docentes ad2
  ON ad2.docente_id = ad1.docente_id
  AND ad2.id <> ad1.id
  AND ad2.deleted_at IS NULL
  AND ad2.activo = TRUE
  AND ad2.vigente = TRUE
  AND ad2.docente_id IS NOT NULL
INNER JOIN asignacion_horarios ah2
  ON ah2.asignacion_docente_id = ad2.id
  AND ah2.horario_id = ah1.horario_id
  AND ah2.deleted_at IS NULL
  AND ah2.activo = TRUE
WHERE oc1.deleted_at IS NULL
  AND oc1.activo = TRUE;
