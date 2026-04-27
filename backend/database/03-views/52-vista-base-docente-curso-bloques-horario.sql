-- ============================================
-- VISTA BASE: vista_base_docente_curso_bloques_horario
-- Bloques de horario y aula por curso, solo para asignaciones docentes vigentes
--
-- Propósito: Una fila por bloque (cursos_horarios) de cada curso asignado al docente
-- con asignación vigente. Sirve para armar la grilla de horas/aulas en la ficha docente.
--
-- Reutiliza: asignaciones_docentes, cursos, paralelos, cursos_horarios, horarios, aulas
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_curso_bloques_horario;

CREATE VIEW vista_base_docente_curso_bloques_horario AS
SELECT
  ad.docente_id AS docente_id,
  c.codigo AS curso_codigo,
  c.color_hex AS curso_color_hex,
  ch.orden_secuencia,
  h.dia,
  h.hora_inicio,
  h.hora_fin,
  h.nombre AS bloque_nombre,
  h.tipo_horario,
  h.turno AS horario_turno,
  p.nombre AS paralelo_nombre,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre,
  a.categoria AS aula_categoria
FROM asignaciones_docentes ad
INNER JOIN cursos c ON c.id = ad.curso_id AND c.deleted_at IS NULL
LEFT JOIN paralelos p ON p.id = c.paralelo_id AND p.deleted_at IS NULL
INNER JOIN cursos_horarios ch ON ch.curso_id = c.id AND ch.deleted_at IS NULL AND ch.activo = TRUE
LEFT JOIN horarios h ON h.id = ch.horario_id AND h.deleted_at IS NULL
LEFT JOIN aulas a ON a.id = ch.aula_id AND a.deleted_at IS NULL
WHERE ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE;
