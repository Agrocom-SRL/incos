-- ============================================
-- VISTA: vista_grupos_capacitacion_listado
-- Una fila por GRUPO de capacitación (módulo CAP) para el listado
-- GET /v1/cursos-capacitacion/grupos (dataFieldName: 'grupos').
--
-- Propósito: el curso es conceptual y los grupos son el curso físico (llevan
-- horarios y aula opcional). Une el grupo con su curso (título, estado crudo,
-- modalidad), su aula, el cupo efectivo (el del grupo o, si es NULL, el del
-- curso), las inscripciones vigentes (PENDIENTE + INSCRITO) y los horarios del
-- grupo ya formateados (agregación de la vista base 154 por grupo).
--
-- Grano distinto de 155 (una fila por CURSO): 155 sigue siendo el listado de
-- cursos; esta vista es el único consumidor a nivel grupo. `curso_estado` es el
-- estado CRUDO: el estado efectivo (por fecha) lo resuelve la capa de aplicación.
--
-- Dependencias (orden sugerido):
-- 1. 01-schemas/21-cursos-capacitacion.sql
-- 2. 154-vista-base-cursos-capacitacion-horarios.sql
-- 3. Esta vista
--
-- Uso:
-- SELECT * FROM vista_grupos_capacitacion_listado ORDER BY curso_titulo, orden;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_grupos_capacitacion_listado;

CREATE VIEW vista_grupos_capacitacion_listado AS
SELECT
  g.id AS grupo_id,
  g.nombre,
  g.orden,
  g.capacitacion_id AS curso_id,
  c.titulo AS curso_titulo,
  c.estado AS curso_estado,
  c.modalidad,
  c.fecha_inicio AS curso_fecha_inicio,
  c.fecha_fin AS curso_fecha_fin,
  c.activo AS curso_activo,
  COALESCE(g.cupo_maximo, c.cupo_maximo) AS cupo_maximo,
  COALESCE(ins.inscritos_count, 0) AS inscritos_count,
  g.aula_id,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre,
  COALESCE(hs.horarios_count, 0) AS horarios_count,
  hs.horarios_etiqueta
FROM capacitacion_grupos g
INNER JOIN capacitaciones c
  ON c.id = g.capacitacion_id
  AND c.deleted_at IS NULL
LEFT JOIN aulas a
  ON a.id = g.aula_id
  AND a.deleted_at IS NULL
LEFT JOIN (
  SELECT
    ci.capacitacion_grupo_id,
    COUNT(*) AS inscritos_count
  FROM capacitacion_inscritos ci
  WHERE ci.estado IN ('PENDIENTE', 'INSCRITO')
    AND ci.activo = TRUE
    AND ci.deleted_at IS NULL
  GROUP BY ci.capacitacion_grupo_id
) ins ON ins.capacitacion_grupo_id = g.id
LEFT JOIN (
  SELECT
    bh.grupo_id,
    COUNT(*) AS horarios_count,
    GROUP_CONCAT(bh.bloque_etiqueta ORDER BY bh.dia_orden, bh.hora_inicio SEPARATOR ' · ') AS horarios_etiqueta
  FROM vista_base_cursos_capacitacion_horarios bh
  WHERE bh.grupo_id IS NOT NULL
  GROUP BY bh.grupo_id
) hs ON hs.grupo_id = g.id
WHERE g.deleted_at IS NULL
  AND g.activo = TRUE;
