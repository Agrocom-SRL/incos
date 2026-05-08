-- ============================================
-- VISTA: vista_bloques_horarios_sin_aula
-- Bloques reales no asignados a aula
--
-- Propósito: Exponer los bloques de cursos_horarios con aula pendiente
-- (`aula_id IS NULL`) para el panel izquierdo en la edición de aulas.
--
-- Reutiliza:
-- - vista_base_bloques_horarios_cursos_contexto (81)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_bloques_horarios_sin_aula;

CREATE OR REPLACE VIEW vista_bloques_horarios_sin_aula AS
SELECT
  b.curso_horario_id,
  b.curso_id,
  b.curso_codigo,
  b.curso_color_hex,
  b.horario_id,
  b.dia,
  b.hora_inicio,
  b.hora_fin,
  b.turno,
  b.numero_bloque,
  b.orden_secuencia,
  NULL AS aula_id,
  NULL AS aula_codigo,
  NULL AS aula_nombre,
  NULL AS aula_categoria,
  NULL AS aula_capacidad,
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
  0 AS tiene_aula,
  1 AS es_sin_aula
FROM vista_base_bloques_horarios_cursos_contexto b
WHERE b.aula_id IS NULL;
