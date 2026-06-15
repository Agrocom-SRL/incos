-- ============================================
-- VISTA BASE: vista_base_cuaderno_evaluacion_columna
-- Columnas del cuaderno (evaluaciones) con periodo académico del bimestre.
--
-- Reutilizada por: CuadernoRepository.listarEvaluaciones.
-- Orden de despliegue: 13-evaluaciones; después de 105.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cuaderno_evaluacion_columna;

CREATE VIEW vista_base_cuaderno_evaluacion_columna AS
SELECT
  e.id,
  e.asignacion_docente_id,
  e.periodo_academico_id,
  pa.gestion_id,
  pa.numero_orden AS bimestre,
  e.tipo_evaluacion_id,
  e.componente,
  e.nombre_evaluacion,
  e.puntos,
  e.fecha,
  e.notas_cerradas,
  e.activo,
  e.created_at,
  e.updated_at
FROM evaluaciones e
INNER JOIN periodos_academicos pa
  ON pa.id = e.periodo_academico_id
  AND pa.division = 'BIMESTRE'
  AND pa.deleted_at IS NULL
  AND pa.activo = TRUE
WHERE e.deleted_at IS NULL
  AND e.activo = TRUE;
