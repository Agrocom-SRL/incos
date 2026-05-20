-- ============================================
-- VISTA: vista_calificacion_contexto_vigente
-- Una fila: gestión académica vigente y bimestre vigente para el módulo de calificaciones.
--
-- Bimestre vigente:
--   1. Periodo BIMESTRE cuya fecha actual cae entre fecha_inicio y fecha_fin.
--   2. Si no hay ninguno en curso: último bimestre por numero_orden de esa gestión.
--
-- Uso:
--   SELECT * FROM vista_calificacion_contexto_vigente;
--
-- Orden de despliegue: después de tablas gestiones y periodos_academicos (07-parte3).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_calificacion_contexto_vigente;

CREATE VIEW vista_calificacion_contexto_vigente AS
SELECT
  ctx.gestion_id,
  ctx.gestion_anio,
  ctx.gestion_nombre,
  COALESCE(ctx.bimestre_en_curso_numero, ctx.bimestre_fallback_numero) AS bimestre_vigente,
  COALESCE(ctx.bimestre_en_curso_nombre, ctx.bimestre_fallback_nombre) AS bimestre_nombre
FROM (
  SELECT
    g.id AS gestion_id,
    g.anio AS gestion_anio,
    g.nombre AS gestion_nombre,
    (
      SELECT pa.numero_orden
      FROM periodos_academicos pa
      WHERE pa.gestion_id = g.id
        AND pa.division = 'BIMESTRE'
        AND pa.activo = TRUE
        AND pa.deleted_at IS NULL
        AND CURDATE() BETWEEN pa.fecha_inicio AND pa.fecha_fin
      ORDER BY pa.numero_orden DESC
      LIMIT 1
    ) AS bimestre_en_curso_numero,
    (
      SELECT pa.nombre
      FROM periodos_academicos pa
      WHERE pa.gestion_id = g.id
        AND pa.division = 'BIMESTRE'
        AND pa.activo = TRUE
        AND pa.deleted_at IS NULL
        AND CURDATE() BETWEEN pa.fecha_inicio AND pa.fecha_fin
      ORDER BY pa.numero_orden DESC
      LIMIT 1
    ) AS bimestre_en_curso_nombre,
    (
      SELECT pa.numero_orden
      FROM periodos_academicos pa
      WHERE pa.gestion_id = g.id
        AND pa.division = 'BIMESTRE'
        AND pa.activo = TRUE
        AND pa.deleted_at IS NULL
      ORDER BY pa.numero_orden DESC
      LIMIT 1
    ) AS bimestre_fallback_numero,
    (
      SELECT pa.nombre
      FROM periodos_academicos pa
      WHERE pa.gestion_id = g.id
        AND pa.division = 'BIMESTRE'
        AND pa.activo = TRUE
        AND pa.deleted_at IS NULL
      ORDER BY pa.numero_orden DESC
      LIMIT 1
    ) AS bimestre_fallback_nombre
  FROM gestiones g
  WHERE g.vigente = TRUE
    AND g.activo = TRUE
    AND g.deleted_at IS NULL
  ORDER BY g.anio DESC
  LIMIT 1
) ctx;
