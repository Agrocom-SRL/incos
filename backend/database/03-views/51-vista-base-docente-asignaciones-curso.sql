-- ============================================
-- VISTA BASE: vista_base_docente_asignaciones_curso
-- Asignaciones de docentes a cursos con contexto académico (paralelo, materia, gestión)
--
-- Propósito: Una fila por registro en asignaciones_docentes (activo), con datos
-- desnormalizados para listados, fichas y agregaciones por gestión.
--
-- Reutiliza tablas: asignaciones_docentes, cursos, paralelos, carreras, periodos,
-- asignaturas_plan, materias, gestiones_planes, gestiones
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_asignaciones_curso;

CREATE VIEW vista_base_docente_asignaciones_curso AS
SELECT
  ad.docente_id AS docente_id,
  ad.id AS asignacion_docente_id,
  ad.vigente,
  ad.carga_horaria,
  ad.fecha_asignacion,
  c.codigo AS curso_codigo,
  c.color_hex AS curso_color_hex,
  p.nombre AS paralelo_nombre,
  p.turno AS paralelo_turno,
  car.nombre AS carrera_nombre,
  car.color_hex AS carrera_color_hex,
  per_par.nombre AS paralelo_periodo_nombre,
  m.nombre AS materia_nombre,
  m.sigla AS materia_sigla,
  per_ap.nombre AS asignatura_periodo_nombre,
  gp.nombre AS gestion_plan_nombre,
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  ap.horas_semanales AS horas_plan
FROM asignaciones_docentes ad
INNER JOIN cursos c ON c.id = ad.curso_id AND c.deleted_at IS NULL
INNER JOIN paralelos p ON p.id = c.paralelo_id AND p.deleted_at IS NULL
LEFT JOIN carreras car ON car.id = p.carrera_id AND car.deleted_at IS NULL
LEFT JOIN periodos per_par ON per_par.id = p.periodo_id AND per_par.deleted_at IS NULL
INNER JOIN asignaturas_plan ap ON ap.id = c.asignatura_plan_id AND ap.deleted_at IS NULL
LEFT JOIN materias m ON m.id = ap.materia_id AND m.deleted_at IS NULL
LEFT JOIN periodos per_ap ON per_ap.id = ap.periodo_id AND per_ap.deleted_at IS NULL
LEFT JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id AND gp.deleted_at IS NULL
LEFT JOIN gestiones g ON g.id = gp.gestion_id AND g.deleted_at IS NULL
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE;
