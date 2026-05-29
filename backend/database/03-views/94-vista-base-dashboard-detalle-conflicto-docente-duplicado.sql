-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_duplicado
-- Detalle de asignación duplicada por docente.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_detalle_conflicto_docente_duplicado;

CREATE VIEW vista_base_dashboard_detalle_conflicto_docente_duplicado AS
SELECT DISTINCT
  ad.docente_id AS docente_id,
  TRIM(CONCAT(
    COALESCE(d.nombres, ''), ' ',
    COALESCE(d.apellido_paterno, ''), ' ',
    COALESCE(d.apellido_materno, '')
  )) AS docente_nombre,
  CONCAT(
    'Asignación duplicada · ',
    COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, CONCAT('OC-', oc.id), '—'),
    ' · ',
    COALESCE(p.nombre, ''),
    CASE
      WHEN pg.turno IS NOT NULL AND TRIM(COALESCE(pg.turno, '')) <> ''
        THEN CONCAT(' · ', pg.turno)
      ELSE ''
    END
  ) AS detalle_linea
FROM vista_base_docente_asignacion_conflicto_curso conf
INNER JOIN asignaciones_docentes ad
  ON ad.id = conf.asignacion_docente_id
  AND ad.deleted_at IS NULL AND ad.activo = TRUE AND ad.vigente = TRUE
INNER JOIN docentes d
  ON d.id = ad.docente_id
  AND d.deleted_at IS NULL AND d.activo = TRUE
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL AND oc.activo = TRUE
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
