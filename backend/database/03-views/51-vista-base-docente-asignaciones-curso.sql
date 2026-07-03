-- ============================================
-- VISTA BASE: vista_base_docente_asignaciones_curso
-- Asignaciones de docentes a oferta_cursos con contexto académico
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignaciones_curso;

CREATE VIEW vista_base_docente_asignaciones_curso AS
SELECT
  oc.id AS oferta_curso_id,
  ad.docente_id AS docente_id,
  ad.id AS asignacion_docente_id,
  ad.vigente,
  ad.carga_horaria,
  ad.fecha_asignacion,
  CONCAT('OC-', oc.id) AS curso_codigo,
  doc.color_hex AS curso_color_hex,
  p.nombre AS paralelo_nombre,
  pg.turno AS paralelo_turno,
  car.nombre AS carrera_nombre,
  car.color_hex AS carrera_color_hex,
  per_par.nombre AS paralelo_periodo_nombre,
  m.nombre AS materia_nombre,
  m.sigla AS materia_sigla,
  per_ap.nombre AS asignatura_periodo_nombre,
  gp.nombre AS gestion_plan_nombre,
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  ap.horas_semanales AS horas_plan,
  -- Columnas aditivas (2026-07-03): contexto de carrera/gestión para las vistas
  -- de actividad del docente (145/147) y el roster de mis-estudiantes (150).
  -- Los consumidores existentes seleccionan por nombre; no se altera nada previo.
  car.id AS carrera_id,
  car.codigo AS carrera_codigo,
  gp.gestion_id AS gestion_id
FROM asignaciones_docentes ad
INNER JOIN oferta_cursos oc
  ON oc.id = ad.oferta_curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
  AND pg.activo = TRUE
INNER JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.deleted_at IS NULL
LEFT JOIN carreras car ON car.id = p.carrera_id AND car.deleted_at IS NULL
LEFT JOIN periodos per_par ON per_par.id = p.periodo_id AND per_par.deleted_at IS NULL
INNER JOIN asignaturas_plan ap ON ap.id = oc.asignatura_plan_id AND ap.deleted_at IS NULL
LEFT JOIN materias m ON m.id = ap.materia_id AND m.deleted_at IS NULL
LEFT JOIN periodos per_ap ON per_ap.id = ap.periodo_id AND per_ap.deleted_at IS NULL
LEFT JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id AND gp.deleted_at IS NULL
LEFT JOIN gestiones g ON g.id = gp.gestion_id AND g.deleted_at IS NULL
LEFT JOIN docentes doc ON doc.id = ad.docente_id AND doc.deleted_at IS NULL
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE;
