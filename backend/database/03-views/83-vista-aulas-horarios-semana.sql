-- ============================================
-- VISTA: vista_aulas_horarios_semana
-- Matriz semanal de aulas + bloques reales (asignados y sin aula)
--
-- Propósito:
-- - Exponer una matriz fija horario×aula para la grilla de aulas.
-- - Incorporar bloques reales asignados a aula.
-- - Incorporar bloques reales sin aula (panel de edición).
--
-- Reutiliza:
-- - vista_base_horarios_semana_activos (45)
-- - vista_base_aulas_activas (58)
-- - vista_base_bloques_horarios_cursos_contexto (81)
-- - vista_bloques_horarios_sin_aula (79)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_aulas_horarios_semana;

CREATE OR REPLACE VIEW vista_aulas_horarios_semana AS
SELECT
  base.curso_horario_id,
  base.curso_id,
  base.curso_codigo,
  base.curso_color_hex,
  base.horario_id,
  base.dia,
  base.hora_inicio,
  base.hora_fin,
  base.turno,
  base.numero_bloque,
  base.orden_secuencia,
  base.aula_id,
  base.aula_codigo,
  base.aula_nombre,
  base.aula_categoria,
  base.aula_capacidad,
  base.materia_id,
  base.materia_sigla,
  base.materia_nombre,
  base.paralelo_id,
  base.paralelo_nombre,
  base.paralelo_turno,
  base.periodo_nombre,
  base.carrera_id,
  base.carrera_nombre,
  base.carrera_codigo,
  base.carrera_color_hex,
  base.docente_nombre,
  base.tiene_aula,
  base.es_sin_aula
FROM (
  SELECT
    b.curso_horario_id,
    b.curso_id,
    b.curso_codigo,
    b.curso_color_hex,
    vh.horario_id AS horario_id,
    vh.dia AS dia,
    vh.hora_inicio AS hora_inicio,
    vh.hora_fin AS hora_fin,
    vh.turno AS turno,
    vh.numero_bloque AS numero_bloque,
    b.orden_secuencia,
    va.aula_id AS aula_id,
    va.aula_codigo AS aula_codigo,
    va.aula_nombre AS aula_nombre,
    va.aula_categoria AS aula_categoria,
    va.aula_capacidad AS aula_capacidad,
    b.materia_id,
    b.materia_sigla,
    b.materia_nombre,
    b.paralelo_id,
    b.paralelo_nombre,
    b.paralelo_turno,
    b.periodo_nombre,
    b.carrera_id,
    b.carrera_nombre,
    b.carrera_codigo,
    b.carrera_color_hex,
    b.docente_nombre,
    CASE
      WHEN b.curso_horario_id IS NOT NULL THEN 1
      ELSE 0
    END AS tiene_aula,
    0 AS es_sin_aula
  FROM vista_base_horarios_semana_activos vh
  CROSS JOIN vista_base_aulas_activas va
  LEFT JOIN vista_base_bloques_horarios_cursos_contexto b
    ON b.horario_id = vh.horario_id
    AND b.aula_id = va.aula_id

  UNION ALL

  SELECT
    sin_aula.curso_horario_id,
    sin_aula.curso_id,
    sin_aula.curso_codigo,
    sin_aula.curso_color_hex,
    sin_aula.horario_id,
    sin_aula.dia,
    sin_aula.hora_inicio,
    sin_aula.hora_fin,
    sin_aula.turno,
    sin_aula.numero_bloque,
    sin_aula.orden_secuencia,
    sin_aula.aula_id,
    sin_aula.aula_codigo,
    sin_aula.aula_nombre,
    sin_aula.aula_categoria,
    sin_aula.aula_capacidad,
    sin_aula.materia_id,
    sin_aula.materia_sigla,
    sin_aula.materia_nombre,
    sin_aula.paralelo_id,
    sin_aula.paralelo_nombre,
    sin_aula.paralelo_turno,
    sin_aula.periodo_nombre,
    sin_aula.carrera_id,
    sin_aula.carrera_nombre,
    sin_aula.carrera_codigo,
    sin_aula.carrera_color_hex,
    sin_aula.docente_nombre,
    sin_aula.tiene_aula,
    sin_aula.es_sin_aula
  FROM vista_bloques_horarios_sin_aula sin_aula
) base;
