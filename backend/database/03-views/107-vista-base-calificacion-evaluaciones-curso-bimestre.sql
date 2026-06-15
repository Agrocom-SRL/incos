-- ============================================
-- VISTA BASE: vista_base_calificacion_evaluaciones_curso_bimestre
-- Cantidad de columnas del cuaderno (evaluaciones) por curso × gestión × bimestre.
--
-- Modelo 3FN: evaluaciones (columna) + periodos_academicos (bimestre del calendario).
--
-- Orden de despliegue: 13-evaluaciones.sql; después de 103.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_evaluaciones_curso_bimestre;

CREATE VIEW vista_base_calificacion_evaluaciones_curso_bimestre AS
SELECT
  ev.asignacion_docente_id,
  pa.gestion_id,
  pa.numero_orden AS bimestre,
  COUNT(DISTINCT ev.id) AS cantidad_evaluaciones
FROM evaluaciones ev
INNER JOIN periodos_academicos pa
  ON pa.id = ev.periodo_academico_id
  AND pa.division = 'BIMESTRE'
  AND pa.deleted_at IS NULL
  AND pa.activo = TRUE
WHERE ev.deleted_at IS NULL
  AND ev.activo = TRUE
GROUP BY
  ev.asignacion_docente_id,
  pa.gestion_id,
  pa.numero_orden;
