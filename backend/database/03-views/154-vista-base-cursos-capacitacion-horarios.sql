-- ============================================
-- VISTA BASE: vista_base_cursos_capacitacion_horarios
-- Una fila por bloque horario de cada capacitación (módulo CAP):
-- capacitacion_horarios → horarios (día, hora inicio/fin, orden) + grupo del
-- bloque (grupo_id/grupo_nombre/grupo_orden; NULL = común a todos los grupos) +
-- aula opcional DEL GRUPO (capacitacion_grupos.aula_id → aulas): el curso es
-- conceptual y los grupos son el curso físico.
--
-- Expone `bloque_etiqueta` ya formateada ("LUN 19:00-21:00") y `dia_orden`
-- para que la vista final de listado (155) solo agregue con GROUP_CONCAT.
--
-- Dependencias (orden sugerido):
-- 1. 01-schemas/21-cursos-capacitacion.sql (capacitaciones, capacitacion_grupos, capacitacion_horarios)
-- 2. 01-schemas/06-estructura-academica-parte2.sql (horarios, aulas)
-- 3. Esta vista
-- (Los horarios tipo_horario=CAPACITACION se crean desde el módulo: POST /cursos-capacitacion/horarios.
--  El aula del grupo es opcional: aula_* puede ser NULL.)
--
-- Uso:
-- SELECT * FROM vista_base_cursos_capacitacion_horarios
-- WHERE capacitacion_id = ? ORDER BY dia_orden, hora_inicio;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cursos_capacitacion_horarios;

CREATE VIEW vista_base_cursos_capacitacion_horarios AS
SELECT
  ch.capacitacion_id,
  ch.id AS capacitacion_horario_id,
  ch.grupo_id,
  g.nombre AS grupo_nombre,
  g.orden AS grupo_orden,
  ch.horario_id,
  ch.orden_secuencia,
  h.nombre AS horario_nombre,
  h.dia,
  LEFT(h.dia, 3) AS dia_abreviado,
  FIELD(h.dia, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') AS dia_orden,
  h.hora_inicio,
  h.hora_fin,
  CONCAT(
    LEFT(h.dia, 3), ' ',
    TIME_FORMAT(h.hora_inicio, '%H:%i'), '-',
    TIME_FORMAT(h.hora_fin, '%H:%i')
  ) AS bloque_etiqueta,
  g.aula_id,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre
FROM capacitacion_horarios ch
INNER JOIN capacitaciones c
  ON c.id = ch.capacitacion_id
  AND c.deleted_at IS NULL
INNER JOIN horarios h
  ON h.id = ch.horario_id
  AND h.deleted_at IS NULL
  AND h.activo = TRUE
LEFT JOIN capacitacion_grupos g
  ON g.id = ch.grupo_id
  AND g.deleted_at IS NULL
  AND g.activo = TRUE
LEFT JOIN aulas a
  ON a.id = g.aula_id
  AND a.deleted_at IS NULL
WHERE ch.deleted_at IS NULL
  AND ch.activo = TRUE;
