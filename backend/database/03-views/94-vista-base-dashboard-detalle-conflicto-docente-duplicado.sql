-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_duplicado
-- Una fila por asignación docente que presenta conflicto de duplicación
-- (mismo curso asignado más de una vez al mismo docente).
--
-- Devuelve: docente_id, docente_nombre, detalle_linea
-- Reutilizada por: vista_dashboard_docentes_conflictos_detalle (92)
--
-- Reutiliza:
--   vista_base_docente_asignacion_conflicto_curso (64),
--   asignaciones_docentes, docentes, cursos,
--   paralelos, asignaturas_plan, materias
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
    COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, c.codigo, '—'),
    ' · ',
    COALESCE(p.nombre, ''),
    CASE
      WHEN p.turno IS NOT NULL AND TRIM(COALESCE(p.turno, '')) <> ''
        THEN CONCAT(' · ', p.turno)
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
INNER JOIN cursos c
  ON c.id = ad.curso_id
  AND c.deleted_at IS NULL AND c.activo = TRUE
INNER JOIN paralelos p
  ON p.id = c.paralelo_id
  AND p.deleted_at IS NULL AND p.activo = TRUE
LEFT JOIN asignaturas_plan ap
  ON ap.id = c.asignatura_plan_id
  AND ap.deleted_at IS NULL AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL AND m.activo = TRUE;
