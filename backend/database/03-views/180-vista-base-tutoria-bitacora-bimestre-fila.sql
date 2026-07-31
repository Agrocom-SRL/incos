-- ============================================
-- VISTA BASE: vista_base_tutoria_bitacora_bimestre_fila
-- Entradas de bitácora de tutoría con el bimestre resuelto por rango de fecha
-- (módulo TIT · titulación, Requisito 3 — planilla de avance "10 en 10").
--
-- Grano: una fila por entrada de bitacora_proyecto con bimestre resuelto.
-- Mismo patrón que la vista 169 (vista_asistencia_consolidado_bimestre_fila):
-- JOIN contra periodos_academicos con division = 'BIMESTRE' y la fecha del
-- hecho dentro del rango [fecha_inicio, fecha_fin] de ese bimestre, en la
-- gestión del proyecto (no de la entrada, que no tiene gestión propia).
--
-- Consumidor: vista 181 (agregado roster-driven por bimestre).
--
-- Uso:
--   SELECT * FROM vista_base_tutoria_bitacora_bimestre_fila
--   WHERE proyecto_grado_id = ? AND bimestre = ?
--   ORDER BY fecha;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_tutoria_bitacora_bimestre_fila;

CREATE VIEW vista_base_tutoria_bitacora_bimestre_fila AS
SELECT
  b.id                  AS bitacora_id,
  b.proyecto_grado_id   AS proyecto_grado_id,
  pa.numero_orden        AS bimestre,
  b.fecha                AS fecha,
  b.porcentaje_avance    AS porcentaje_avance,
  b.observaciones        AS observaciones
FROM bitacora_proyecto b
INNER JOIN proyectos_grado p
  ON p.id = b.proyecto_grado_id
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
INNER JOIN periodos_academicos pa
  ON b.fecha BETWEEN pa.fecha_inicio AND pa.fecha_fin
  AND pa.gestion_id = p.gestion_id
  AND pa.division = 'BIMESTRE'
  AND pa.deleted_at IS NULL
WHERE b.activo = TRUE
  AND b.deleted_at IS NULL;
