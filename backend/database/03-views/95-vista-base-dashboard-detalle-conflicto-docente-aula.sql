-- ============================================
-- VISTA BASE: vista_base_dashboard_detalle_conflicto_docente_aula
-- Una fila por asignación docente que presenta conflicto de aula
-- (misma aula ocupada en el mismo bloque horario por dos cursos distintos).
--
-- Devuelve: docente_id, docente_nombre, detalle_linea
-- Reutilizada por: vista_dashboard_docentes_conflictos_detalle (92)
--
-- Reutiliza:
--   vista_base_docente_asignacion_conflicto_aula (66),
--   asignaciones_docentes, docentes, cursos, cursos_horarios,
--   horarios, aulas, paralelos, asignaturas_plan, materias
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
    COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, c.codigo, '—'),
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
INNER JOIN cursos c
  ON c.id = ad.curso_id
  AND c.deleted_at IS NULL AND c.activo = TRUE
INNER JOIN cursos_horarios ch
  ON ch.curso_id = c.id
  AND ch.deleted_at IS NULL AND ch.activo = TRUE
  AND ch.aula_id IS NOT NULL
INNER JOIN horarios h
  ON h.id = ch.horario_id
  AND h.deleted_at IS NULL AND h.activo = TRUE
INNER JOIN aulas au
  ON au.id = ch.aula_id
  AND au.deleted_at IS NULL AND au.activo = TRUE
INNER JOIN paralelos p
  ON p.id = c.paralelo_id
  AND p.deleted_at IS NULL AND p.activo = TRUE
LEFT JOIN asignaturas_plan ap
  ON ap.id = c.asignatura_plan_id
  AND ap.deleted_at IS NULL AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL AND m.activo = TRUE;
