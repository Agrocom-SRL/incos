-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_horario
-- Detalle de conflicto de horario por docente (misma franja, dos asignaciones).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_detalle_conflicto_docente_horario;

CREATE VIEW vista_base_dashboard_detalle_conflicto_docente_horario AS
SELECT DISTINCT
  ad.docente_id AS docente_id,
  TRIM(CONCAT(
    COALESCE(d.nombres, ''), ' ',
    COALESCE(d.apellido_paterno, ''), ' ',
    COALESCE(d.apellido_materno, '')
  )) AS docente_nombre,
  pg.id AS paralelo_gestion_id,
  oc.id AS oferta_curso_id,
  'horario' AS tipo_conflicto,
  CONCAT(
    COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, CONCAT('OC-', oc.id), '—'),
    ' · ',
    UPPER(COALESCE(h.dia, '')),
    ' ',
    LEFT(COALESCE(TIME_FORMAT(h.hora_inicio, '%H:%i'), ''), 5),
    '-',
    LEFT(COALESCE(TIME_FORMAT(h.hora_fin, '%H:%i'), ''), 5),
    ' · ',
    COALESCE(p.nombre, ''),
    CASE
      WHEN pg.turno IS NOT NULL AND TRIM(COALESCE(pg.turno, '')) <> ''
        THEN CONCAT(' · ', pg.turno)
      ELSE ''
    END
  ) AS detalle_linea
FROM vista_base_docente_asignacion_conflicto_horario conf
INNER JOIN asignaciones_docentes ad
  ON ad.id = conf.asignacion_docente_id
  AND ad.deleted_at IS NULL AND ad.activo = TRUE AND ad.vigente = TRUE
INNER JOIN docentes d
  ON d.id = ad.docente_id
  AND d.deleted_at IS NULL AND d.activo = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL AND oc.activo = TRUE
INNER JOIN asignacion_horarios ah
  ON ah.asignacion_docente_id = ad.id
  AND ah.deleted_at IS NULL AND ah.activo = TRUE
INNER JOIN horarios h
  ON h.id = ah.horario_id
  AND h.deleted_at IS NULL AND h.activo = TRUE
INNER JOIN (
  SELECT DISTINCT
    ad1.docente_id,
    ah1.horario_id
  FROM asignaciones_docentes ad1
  INNER JOIN asignacion_horarios ah1
    ON ah1.asignacion_docente_id = ad1.id
    AND ah1.deleted_at IS NULL
    AND ah1.activo = TRUE
  INNER JOIN asignaciones_docentes ad2
    ON ad2.docente_id = ad1.docente_id
    AND ad2.id <> ad1.id
    AND ad2.deleted_at IS NULL
    AND ad2.activo = TRUE
    AND ad2.vigente = TRUE
  INNER JOIN asignacion_horarios ah2
    ON ah2.asignacion_docente_id = ad2.id
    AND ah2.deleted_at IS NULL
    AND ah2.activo = TRUE
    AND ah2.horario_id = ah1.horario_id
  WHERE ad1.deleted_at IS NULL
    AND ad1.activo = TRUE
    AND ad1.vigente = TRUE
    AND ad1.docente_id IS NOT NULL
) choque
  ON choque.docente_id = ad.docente_id
  AND choque.horario_id = ah.horario_id
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.deleted_at IS NULL AND p.activo = TRUE
LEFT JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL AND m.activo = TRUE;
