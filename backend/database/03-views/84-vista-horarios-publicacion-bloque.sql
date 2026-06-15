-- ============================================
-- VISTA: vista_horarios_publicacion_bloque
-- Bloques de cursos con contexto de paralelo + aula (lectura / publicación)
--
-- Propósito:
-- - Una fila por bloque (curso_horario) para armar planes por paralelo en UI
--   sin N+1 al endpoint GET schedule por paralelo.
--
-- Reutiliza:
-- - vista_base_bloques_horarios_cursos_contexto (81)
-- - aulas
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_publicacion_bloque;

CREATE OR REPLACE VIEW vista_horarios_publicacion_bloque AS
SELECT
  pg.id AS paralelo_gestion_id,
  pg.estado AS paralelo_gestion_estado,
  b.paralelo_id,
  b.paralelo_nombre,
  b.paralelo_turno,
  b.carrera_id,
  b.carrera_nombre,
  b.carrera_codigo,
  b.carrera_color_hex,
  b.periodo_nombre,
  b.curso_id,
  b.curso_codigo,
  b.curso_color_hex,
  b.materia_id,
  b.materia_sigla,
  b.materia_nombre,
  b.horas_plan,
  b.docente_nombre,
  b.curso_horario_id,
  b.horario_id,
  b.dia,
  b.hora_inicio,
  b.hora_fin,
  b.turno AS bloque_turno,
  b.orden_secuencia,
  b.aula_id,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre
FROM vista_base_bloques_horarios_cursos_contexto b
INNER JOIN oferta_cursos oc
  ON oc.id = b.curso_id
  AND oc.deleted_at IS NULL
  AND oc.activo = TRUE
INNER JOIN paralelos_gestion pg
  ON pg.id = oc.paralelo_gestion_id
  AND pg.deleted_at IS NULL
LEFT JOIN aulas a
  ON a.id = b.aula_id
  AND a.deleted_at IS NULL
  AND a.activo = 1;
