-- ============================================
-- VISTA: vista_cursos_capacitacion_listado
-- Una fila por capacitación (módulo CAP) para el listado
-- GET /v1/cursos-capacitacion (dataFieldName: 'cursosCapacitacion').
--
-- Propósito: datos del curso (título, costo del curso, costo de matrícula, entidad
-- certificadora, modalidad, nivel, dirigido_a, duración, cupo, fechas (fecha_fin
-- opcional), estado, resumen de aulas de sus grupos) +
-- grupos_count, tiene_costo y cobra_matricula, +
-- agregados de inscritos (inscritos_count = capacitacion_inscritos activos
-- con estado='INSCRITO'; cupo_disponible = cupo_maximo - inscritos_count,
-- informativo en el MVP: no bloquea la inscripción) + horarios formateados
-- (vista base 154 agrupada por grupo, ej: "Grupo 1 – Mañana: SAB 08:00-12:00 | Grupo 2 – Tarde: SAB 15:00-19:00").
--
-- Incluye `activo` (no filtra por activo: el listado soporta incluirInactivos
-- y el switch ACTIVAR); solo excluye soft-deleted (deleted_at IS NULL).
--
-- Dependencias (orden sugerido):
-- 1. 01-schemas/21-cursos-capacitacion.sql (capacitaciones, capacitacion_inscritos)
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
  c.tiene_costo,
  c.cobra_matricula,
  c.costo,
  c.costo_matricula,
  c.entidad_certificadora,
  c.modalidad,
  c.nivel,
  c.dirigido_a,
  c.duracion,
  c.cupo_maximo,
  c.fecha_inicio,
  c.fecha_fin,
  c.estado,
  gs.aulas_resumen,
  COALESCE(ins.inscritos_count, 0) AS inscritos_count,
  c.cupo_maximo - COALESCE(ins.inscritos_count, 0) AS cupo_disponible,
  COALESCE(gs.grupos_count, 0) AS grupos_count,
  COALESCE(hs.horarios_count, 0) AS horarios_count,
  hs.horarios_detalle,
  c.activo,
  c.created_at
FROM capacitaciones c
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
    g.capacitacion_id,
    COUNT(*) AS grupos_count,
    GROUP_CONCAT(DISTINCT a.nombre ORDER BY a.nombre SEPARATOR ', ') AS aulas_resumen
  FROM capacitacion_grupos g
  LEFT JOIN aulas a
    ON a.id = g.aula_id
    AND a.deleted_at IS NULL
  WHERE g.activo = TRUE
    AND g.deleted_at IS NULL
  GROUP BY g.capacitacion_id
) gs ON gs.capacitacion_id = c.id
LEFT JOIN (
  -- Un texto por grupo ("Grupo 1 – Mañana: SAB 08:00-12:00") y luego uno por curso
  SELECT
    xg.capacitacion_id,
    SUM(xg.bloques) AS horarios_count,
    GROUP_CONCAT(xg.texto ORDER BY xg.grupo_orden, xg.grupo_id SEPARATOR ' | ') AS horarios_detalle
  FROM (
    SELECT
      bh.capacitacion_id,
      bh.grupo_id,
      bh.grupo_orden,
      COUNT(*) AS bloques,
      CONCAT_WS(': ', bh.grupo_nombre, GROUP_CONCAT(
        bh.bloque_etiqueta
        ORDER BY bh.dia_orden, bh.hora_inicio
        SEPARATOR ' · '
      )) AS texto
    FROM vista_base_cursos_capacitacion_horarios bh
    GROUP BY bh.capacitacion_id, bh.grupo_id, bh.grupo_orden, bh.grupo_nombre
  ) xg
  GROUP BY xg.capacitacion_id
) hs ON hs.capacitacion_id = c.id
WHERE c.deleted_at IS NULL;
