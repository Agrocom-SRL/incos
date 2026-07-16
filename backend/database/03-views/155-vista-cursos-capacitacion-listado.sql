-- ============================================
-- VISTA: vista_cursos_capacitacion_listado
-- Una fila por capacitación (módulo CAP) para el listado
-- GET /v1/cursos-capacitacion (dataFieldName: 'cursosCapacitacion').
--
-- Propósito: datos del curso (título, costo, cupo, fechas, estado, aula) +
-- agregados de inscritos (inscritos_count = capacitacion_inscritos activos
-- con estado='INSCRITO'; cupo_disponible = cupo_maximo - inscritos_count,
-- informativo en el MVP: no bloquea la inscripción) + horarios formateados
-- (GROUP_CONCAT de la vista base 154, ej: "LUN 19:00-21:00 · MIE 19:00-21:00").
--
-- Incluye `activo` (no filtra por activo: el listado soporta incluirInactivos
-- y el switch ACTIVAR); solo excluye soft-deleted (deleted_at IS NULL).
--
-- Dependencias (orden sugerido):
-- 1. 01-schemas/25-cursos-capacitacion.sql (capacitaciones, capacitacion_inscritos)
-- 2. 154-vista-base-cursos-capacitacion-horarios.sql
-- 3. Esta vista
--
-- Uso:
-- SELECT * FROM vista_cursos_capacitacion_listado ORDER BY fecha_inicio DESC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_cursos_capacitacion_listado;

CREATE VIEW vista_cursos_capacitacion_listado AS
SELECT
  c.id,
  c.titulo,
  c.descripcion,
  c.costo,
  c.cupo_maximo,
  c.fecha_inicio,
  c.fecha_fin,
  c.estado,
  c.aula_id,
  a.codigo AS aula_codigo,
  a.nombre AS aula_nombre,
  COALESCE(ins.inscritos_count, 0) AS inscritos_count,
  c.cupo_maximo - COALESCE(ins.inscritos_count, 0) AS cupo_disponible,
  COALESCE(hs.horarios_count, 0) AS horarios_count,
  hs.horarios_detalle,
  c.activo,
  c.created_at
FROM capacitaciones c
LEFT JOIN aulas a
  ON a.id = c.aula_id
  AND a.deleted_at IS NULL
LEFT JOIN (
  SELECT
    ci.capacitacion_id,
    COUNT(*) AS inscritos_count
  FROM capacitacion_inscritos ci
  WHERE ci.estado = 'INSCRITO'
    AND ci.activo = TRUE
    AND ci.deleted_at IS NULL
  GROUP BY ci.capacitacion_id
) ins ON ins.capacitacion_id = c.id
LEFT JOIN (
  SELECT
    bh.capacitacion_id,
    COUNT(*) AS horarios_count,
    GROUP_CONCAT(
      bh.bloque_etiqueta
      ORDER BY bh.dia_orden, bh.hora_inicio
      SEPARATOR ' · '
    ) AS horarios_detalle
  FROM vista_base_cursos_capacitacion_horarios bh
  GROUP BY bh.capacitacion_id
) hs ON hs.capacitacion_id = c.id
WHERE c.deleted_at IS NULL;
