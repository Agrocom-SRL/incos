-- ============================================
-- VISTA: vista_horarios_cursos_sin_docente
-- Ofertas activas sin docente vigente asignado.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_cursos_sin_docente;

CREATE VIEW vista_horarios_cursos_sin_docente AS
SELECT
  oc.id AS curso_id,
  CONCAT('OC-', oc.id) AS curso_codigo,
  m.id AS materia_id,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  p.id AS paralelo_id,
  p.nombre AS paralelo_nombre,
  pg.turno AS paralelo_turno,
  per.nombre AS periodo_nombre,
  car.id AS carrera_id,
  car.nombre AS carrera_nombre,
  car.codigo AS carrera_codigo
FROM oferta_cursos oc
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
  AND pg.activo = TRUE
INNER JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.deleted_at IS NULL
  AND p.activo = TRUE
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.deleted_at IS NULL
  AND per.activo = TRUE
LEFT JOIN carreras car
  ON car.id = p.carrera_id
  AND car.deleted_at IS NULL
  AND car.activo = TRUE
INNER JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = TRUE
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
  AND m.activo = TRUE
WHERE oc.deleted_at IS NULL
  AND oc.activo = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM vista_base_docentes_vigentes_por_curso d
    WHERE d.curso_id = oc.id
  );
