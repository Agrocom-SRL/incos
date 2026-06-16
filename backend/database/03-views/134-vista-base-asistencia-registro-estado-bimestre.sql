-- ============================================
-- VISTA BASE: vista_base_asistencia_registro_estado_bimestre
-- Estado agregado del registro de asistencia por curso × bimestre (ABIERTO/CERRADO),
-- DERIVADO de sesiones_clase (no se almacena en tabla). Patrón de la vista 114.
--
-- Regla: CERRADO si existe al menos una sesión y TODAS las sesiones del curso en
-- ese bimestre están CERRADA; en caso contrario ABIERTO. Sin sesiones = ABIERTO
-- (no hay nada cerrado todavía).
--
-- 1 fila = 1 curso (asignacion_docente_id) × 1 bimestre (periodo_academico_id).
--
-- Consumidor: AsistenciaRegistroEstadoViewRepository → GetCalendario / GetPlanilla.
-- Orden de despliegue: después de 17 (sesiones_clase).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asistencia_registro_estado_bimestre;

CREATE VIEW vista_base_asistencia_registro_estado_bimestre AS
SELECT
  sc.asignacion_docente_id,
  sc.periodo_academico_id,
  COUNT(*)                                                         AS total_sesiones,
  SUM(CASE WHEN sc.estado = 'CERRADA' THEN 1 ELSE 0 END)          AS sesiones_cerradas,
  CASE
    WHEN COUNT(*) > 0
      AND COUNT(*) = SUM(CASE WHEN sc.estado = 'CERRADA' THEN 1 ELSE 0 END)
    THEN 'CERRADO'
    ELSE 'ABIERTO'
  END                                                             AS registro_estado
FROM sesiones_clase sc
WHERE sc.activo = TRUE
  AND sc.deleted_at IS NULL
  AND sc.periodo_academico_id IS NOT NULL
GROUP BY sc.asignacion_docente_id, sc.periodo_academico_id;
