-- ============================================
-- VISTA BASE: vista_base_asistencia_sesion_dia_tomado
-- Días en que se TOMÓ asistencia por curso (derivada de sesiones_clase, NO de
-- contar filas de `asistencias`). Su existencia marca el "dot" del calendario y
-- alimenta el denominador del % (un día tomado = una sesión existente).
--
-- 1 fila = 1 sesión (1 curso × 1 fecha). Expone el estado de cierre y si la
-- sesión fue especial (taller/recuperación fuera de horario).
--
-- Consumidor: AsistenciaSesionViewRepository → GetCalendarioAsistenciaUseCase.
-- Orden de despliegue: después de 17 (sesiones_clase).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asistencia_sesion_dia_tomado;

CREATE VIEW vista_base_asistencia_sesion_dia_tomado AS
SELECT
  sc.id                  AS sesion_clase_id,
  sc.asignacion_docente_id,
  sc.periodo_academico_id,
  sc.fecha,
  sc.hora_inicio,
  sc.hora_fin,
  sc.es_especial,
  sc.motivo,
  sc.estado             AS sesion_estado
FROM sesiones_clase sc
WHERE sc.activo = TRUE
  AND sc.deleted_at IS NULL;
