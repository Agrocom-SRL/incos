-- ============================================
-- VISTA BASE: vista_base_bloques_horarios_cursos_contexto
-- Bloques reales de cursos_horarios con contexto académico
--
-- Propósito: Centralizar en una vista base toda la información de bloque
-- (curso/horario/aula/materia/paralelo/carrera/periodo/docente) para que otras
-- vistas solo compongan resultados sin repetir joins.
--
-- Reutiliza:
-- - cursos_horarios, cursos, horarios, paralelos, periodos, carreras,
--   asignaturas_plan, materias
-- - vista_base_docentes_vigentes_por_curso
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_bloques_horarios_cursos_contexto;

CREATE VIEW vista_base_bloques_horarios_cursos_contexto AS
SELECT
  ch.id AS curso_horario_id,
  c.id AS curso_id,
  c.codigo AS curso_codigo,
  c.color_hex AS curso_color_hex,
  h.id AS horario_id,
  h.dia AS dia,
  h.hora_inicio AS hora_inicio,
  h.hora_fin AS hora_fin,
  h.turno AS turno,
  h.numero_bloque AS numero_bloque,
  ch.orden_secuencia AS orden_secuencia,
  ch.aula_id AS aula_id,
  m.id AS materia_id,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  p.id AS paralelo_id,
  p.nombre AS paralelo_nombre,
  p.turno AS paralelo_turno,
  per.nombre AS periodo_nombre,
  car.id AS carrera_id,
  car.nombre AS carrera_nombre,
  car.codigo AS carrera_codigo,
  car.color_hex AS carrera_color_hex,
  d.docente_nombre AS docente_nombre
FROM cursos_horarios ch
INNER JOIN cursos c ON c.id = ch.curso_id
  AND c.deleted_at IS NULL
  AND c.activo = 1
INNER JOIN horarios h ON h.id = ch.horario_id
  AND h.deleted_at IS NULL
  AND h.activo = 1
INNER JOIN paralelos p ON p.id = c.paralelo_id
  AND p.deleted_at IS NULL
  AND p.activo = 1
LEFT JOIN periodos per ON per.id = p.periodo_id
  AND per.deleted_at IS NULL
  AND per.activo = 1
LEFT JOIN carreras car ON car.id = p.carrera_id
  AND car.deleted_at IS NULL
  AND car.activo = 1
LEFT JOIN asignaturas_plan ap ON ap.id = c.asignatura_plan_id
  AND ap.deleted_at IS NULL
  AND ap.activo = 1
LEFT JOIN materias m ON m.id = ap.materia_id
  AND m.deleted_at IS NULL
  AND m.activo = 1
LEFT JOIN vista_base_docentes_vigentes_por_curso d ON d.curso_id = c.id
WHERE ch.deleted_at IS NULL
  AND ch.activo = 1;
