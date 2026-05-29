-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_aula
-- Detalle de conflicto de aula por docente.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_detalle_conflicto_docente_aula;

CREATE VIEW vista_base_dashboard_detalle_conflicto_docente_aula AS
SELECT DISTINCT
  ad.docente_id AS docente_id,
  TRIM(CONCAT(
    COALESCE(d.nombres, ''), ' ',
    COALESCE(d.apellido_paterno, ''), ' ',
    COALESCE(d.apellido_materno, '')
  )) AS docente_nombre,
  CONCAT(
    COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, CONCAT('OC-', oc.id), '—'),
    ' · ',
    UPPER(COALESCE(h.dia, '')),
    ' ',
    LEFT(COALESCE(TIME_FORMAT(h.hora_inicio, '%H:%i'), ''), 5),
    '-',
    LEFT(COALESCE(TIME_FORMAT(h.hora_fin, '%H:%i'), ''), 5),
    ' · Aula ',
    COALESCE(NULLIF(TRIM(au.codigo), ''), au.nombre, 'sin código')
  ) AS detalle_linea
FROM vista_base_docente_asignacion_conflicto_aula conf
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
  AND ah.aula_id IS NOT NULL
INNER JOIN horarios h
  ON h.id = ah.horario_id
  AND h.deleted_at IS NULL AND h.activo = TRUE
INNER JOIN aulas au
  ON au.id = ah.aula_id
  AND au.deleted_at IS NULL AND au.activo = TRUE
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
