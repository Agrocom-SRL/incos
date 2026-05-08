USE instituto_incos;

DROP VIEW IF EXISTS vista_aulas_horarios_semana;

CREATE OR REPLACE VIEW vista_aulas_horarios_semana AS
SELECT
  ch.id AS curso_horario_id,
  c.id AS curso_id,
  c.codigo AS curso_codigo,
  c.color_hex AS curso_color_hex,
  vh.horario_id AS horario_id,
  vh.dia AS dia,
  vh.hora_inicio AS hora_inicio,
  vh.hora_fin AS hora_fin,
  vh.turno AS turno,
  vh.numero_bloque AS numero_bloque,
  va.aula_id AS aula_id,
  va.aula_codigo AS aula_codigo,
  va.aula_nombre AS aula_nombre,
  va.aula_categoria AS aula_categoria,
  va.aula_capacidad AS aula_capacidad,
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
  CASE
    WHEN ch.aula_id IS NOT NULL THEN 1
    ELSE 0
  END AS tiene_aula
FROM vista_base_horarios_semana_activos vh
CROSS JOIN vista_base_aulas_activas va
LEFT JOIN cursos_horarios ch ON ch.horario_id = vh.horario_id
  AND ch.aula_id = va.aula_id
  AND ch.deleted_at IS NULL
  AND ch.activo = 1
LEFT JOIN cursos c ON c.id = ch.curso_id AND c.deleted_at IS NULL AND c.activo = 1
LEFT JOIN paralelos p ON p.id = c.paralelo_id AND p.deleted_at IS NULL AND p.activo = 1
LEFT JOIN periodos per ON per.id = p.periodo_id AND per.deleted_at IS NULL AND per.activo = 1
LEFT JOIN carreras car ON car.id = p.carrera_id AND car.deleted_at IS NULL AND car.activo = 1
LEFT JOIN asignaturas_plan ap ON ap.id = c.asignatura_plan_id AND ap.deleted_at IS NULL AND ap.activo = 1
LEFT JOIN materias m ON m.id = ap.materia_id AND m.deleted_at IS NULL AND m.activo = 1;
