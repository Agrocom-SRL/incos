-- ============================================
-- VISTA: vista_horarios_cursos_sin_docente
-- Cursos activos sin asignación docente vigente (para panel lateral de horarios)
--
-- Propósito:
-- - Listar materias/cursos por paralelo que aún no tienen fila en
--   vista_base_docentes_vigentes_por_curso.
--
-- Reutiliza:
-- - vista_base_docentes_vigentes_por_curso (80)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_cursos_sin_docente;

CREATE OR REPLACE VIEW vista_horarios_cursos_sin_docente AS
SELECT
  c.id AS curso_id,
  c.codigo AS curso_codigo,
  m.id AS materia_id,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  p.id AS paralelo_id,
  p.nombre AS paralelo_nombre,
  p.turno AS paralelo_turno,
  per.nombre AS periodo_nombre,
  car.id AS carrera_id,
  car.nombre AS carrera_nombre,
  car.codigo AS carrera_codigo
FROM cursos c
INNER JOIN paralelos p
  ON p.id = c.paralelo_id
  AND p.deleted_at IS NULL
  AND p.activo = 1
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.deleted_at IS NULL
  AND per.activo = 1
LEFT JOIN carreras car
  ON car.id = p.carrera_id
  AND car.deleted_at IS NULL
  AND car.activo = 1
LEFT JOIN asignaturas_plan ap
  ON ap.id = c.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = 1
LEFT JOIN materias m
  ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
  AND m.activo = 1
WHERE c.deleted_at IS NULL
  AND c.activo = 1
  AND NOT EXISTS (
    SELECT 1
    FROM vista_base_docentes_vigentes_por_curso d
    WHERE d.curso_id = c.id
  );
