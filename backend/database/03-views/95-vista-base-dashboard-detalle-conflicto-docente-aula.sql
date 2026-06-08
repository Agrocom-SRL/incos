-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_aula
-- Detalle de cruce de aula efectiva entre paralelos (panel lateral docentes).
--
-- Aula efectiva = COALESCE(asignacion_horarios.aula_id, paralelos_gestion.aula_id).
-- Solo franjas con otro paralelo_gestion en la misma aula+horario.
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
  pg.id AS paralelo_gestion_id,
  oc.id AS oferta_curso_id,
  'aula' AS tipo_conflicto,
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
INNER JOIN horarios h
  ON h.id = ah.horario_id
  AND h.deleted_at IS NULL AND h.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN aulas au
  ON au.id = COALESCE(ah.aula_id, pg.aula_id)
  AND au.deleted_at IS NULL AND au.activo = TRUE
INNER JOIN (
  SELECT DISTINCT
    base.asignacion_docente_id,
    base.horario_id
  FROM (
    SELECT
      ad_b.id AS asignacion_docente_id,
      ah_b.horario_id,
      COALESCE(ah_b.aula_id, pg_b.aula_id) AS aula_efectiva_id,
      pg_b.id AS paralelo_gestion_id
    FROM asignacion_horarios ah_b
    INNER JOIN asignaciones_docentes ad_b
      ON ad_b.id = ah_b.asignacion_docente_id
      AND ad_b.deleted_at IS NULL
      AND ad_b.activo = TRUE
      AND ad_b.vigente = TRUE
    INNER JOIN oferta_cursos oc_b
      ON oc_b.id = ad_b.oferta_curso_id
      AND oc_b.deleted_at IS NULL
      AND oc_b.activo = TRUE
    INNER JOIN paralelos_gestion pg_b
      ON pg_b.id = oc_b.paralelo_gestion_id
      AND pg_b.deleted_at IS NULL
    WHERE ah_b.deleted_at IS NULL
      AND ah_b.activo = TRUE
      AND ah_b.horario_id IS NOT NULL
      AND COALESCE(ah_b.aula_id, pg_b.aula_id) IS NOT NULL
  ) base
  INNER JOIN (
    SELECT
      ah_o.horario_id,
      COALESCE(ah_o.aula_id, pg_o.aula_id) AS aula_efectiva_id,
      pg_o.id AS paralelo_gestion_id
    FROM asignacion_horarios ah_o
    INNER JOIN asignaciones_docentes ad_o
      ON ad_o.id = ah_o.asignacion_docente_id
      AND ad_o.deleted_at IS NULL
      AND ad_o.activo = TRUE
      AND ad_o.vigente = TRUE
    INNER JOIN oferta_cursos oc_o
      ON oc_o.id = ad_o.oferta_curso_id
      AND oc_o.deleted_at IS NULL
      AND oc_o.activo = TRUE
    INNER JOIN paralelos_gestion pg_o
      ON pg_o.id = oc_o.paralelo_gestion_id
      AND pg_o.deleted_at IS NULL
    WHERE ah_o.deleted_at IS NULL
      AND ah_o.activo = TRUE
      AND ah_o.horario_id IS NOT NULL
      AND COALESCE(ah_o.aula_id, pg_o.aula_id) IS NOT NULL
  ) otro
    ON otro.aula_efectiva_id = base.aula_efectiva_id
    AND otro.horario_id = base.horario_id
    AND otro.paralelo_gestion_id <> base.paralelo_gestion_id
) conflicto_slot
  ON conflicto_slot.asignacion_docente_id = ad.id
  AND conflicto_slot.horario_id = ah.horario_id
LEFT JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL AND m.activo = TRUE;
