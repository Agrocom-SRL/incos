-- ============================================
-- VISTA: vista_tutoria_proyectos_listado
-- Listado de proyectos de grado con agregados de seguimiento (módulo TUT).
--
-- Grano: una fila por proyecto de grado vigente. Vista final delgada
-- (patrón 87): agrega la base 159 por proyecto y suma dos subconsultas
-- livianas sobre los satélites (bitácora y avances), sin reescribir joins.
--
-- Bases:
--   - 159 vista_base_tutoria_proyecto_integrante_fila (identidad + integrantes)
--   - bitacora_proyecto (última tutoría, total, observaciones pendientes,
--     MÁXIMO porcentaje_avance registrado, última observación del tutor)
--   - avances_proyecto (avances pendientes de revisión u observados)
--
-- porcentaje_avance = MAX(...), no el último registro cronológico (2026-08-11,
-- pedido explícito del usuario): una revisión posterior a un avance distinto
-- (p. ej. re-revisar un avance anterior después de haber aprobado uno al
-- 100%) NO debe hacer retroceder el % del proyecto. El avance del proyecto
-- es monotónico creciente en la práctica; el máximo histórico es la lectura
-- correcta de "en qué % está el proyecto", no la última fila insertada.
--
-- ultima_observacion (2026-07-31, extensión Requisito 2 — reporte de avance
-- por carrera): subconsulta correlacionada LIMIT 1 (no GROUP_CONCAT, para no
-- arriesgar el separador con comas dentro del texto libre del tutor). Columna
-- aditiva: no rompe consumidores existentes.
--
-- La bandeja del tutor ("mis tutorados") NO es otra vista: es
-- WHERE tutor_id = ? en el repositorio.
--
-- Consumidores:
--   - ProyectoGradoListadoViewRepository (backend) → GET /proyectos-grado,
--     GET /proyectos-grado/mis-tutorados, GET /proyectos-grado/:id,
--     GET /proyectos-grado/mi-proyecto.
--
-- Uso:
--   SELECT * FROM vista_tutoria_proyectos_listado
--   WHERE gestion_id = ?
--   ORDER BY titulo;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_tutoria_proyectos_listado;

CREATE VIEW vista_tutoria_proyectos_listado AS
SELECT
  base.proyecto_grado_id   AS proyecto_grado_id,
  base.titulo              AS titulo,
  base.proyecto_estado     AS proyecto_estado,
  base.gestion_id          AS gestion_id,
  base.carrera_id          AS carrera_id,
  base.carrera_codigo      AS carrera_codigo,
  base.carrera_nombre      AS carrera_nombre,
  base.modalidad_id        AS modalidad_id,
  base.modalidad_codigo    AS modalidad_codigo,
  base.modalidad_nombre    AS modalidad_nombre,
  base.tutor_id            AS tutor_id,
  base.tutor_nombre        AS tutor_nombre,
  COUNT(CASE WHEN base.integrante_estado = 'ACTIVO' THEN 1 END) AS cantidad_integrantes,
  bit.ultima_tutoria_fecha      AS ultima_tutoria_fecha,
  COALESCE(bit.total_tutorias, 0)          AS total_tutorias,
  COALESCE(bit.observaciones_pendientes, 0) AS observaciones_pendientes,
  bit.porcentaje_avance         AS porcentaje_avance,
  bit.ultima_observacion        AS ultima_observacion,
  COALESCE(av.avances_pendientes, 0)       AS avances_pendientes
FROM vista_base_tutoria_proyecto_integrante_fila base
LEFT JOIN (
  SELECT
    b.proyecto_grado_id,
    MAX(b.fecha) AS ultima_tutoria_fecha,
    COUNT(*) AS total_tutorias,
    SUM(CASE WHEN b.estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS observaciones_pendientes,
    MAX(b.porcentaje_avance) AS porcentaje_avance,
    (
      SELECT b2.observaciones
      FROM bitacora_proyecto b2
      WHERE b2.proyecto_grado_id = b.proyecto_grado_id
        AND b2.activo = TRUE
        AND b2.deleted_at IS NULL
      ORDER BY b2.fecha DESC, b2.id DESC
      LIMIT 1
    ) AS ultima_observacion
  FROM bitacora_proyecto b
  WHERE b.activo = TRUE
    AND b.deleted_at IS NULL
  GROUP BY b.proyecto_grado_id
) bit ON bit.proyecto_grado_id = base.proyecto_grado_id
LEFT JOIN (
  SELECT
    a.proyecto_grado_id,
    SUM(CASE WHEN a.estado_revision IN ('PENDIENTE_REVISION', 'OBSERVADO') THEN 1 ELSE 0 END) AS avances_pendientes
  FROM avances_proyecto a
  WHERE a.activo = TRUE
    AND a.deleted_at IS NULL
  GROUP BY a.proyecto_grado_id
) av ON av.proyecto_grado_id = base.proyecto_grado_id
GROUP BY
  base.proyecto_grado_id, base.titulo, base.proyecto_estado, base.gestion_id,
  base.carrera_id, base.carrera_codigo, base.carrera_nombre,
  base.modalidad_id, base.modalidad_codigo, base.modalidad_nombre,
  base.tutor_id, base.tutor_nombre,
  bit.ultima_tutoria_fecha, bit.total_tutorias, bit.observaciones_pendientes,
  bit.porcentaje_avance, bit.ultima_observacion, av.avances_pendientes;
