-- ============================================
-- VISTA: vista_dashboard_docentes_conflictos_detalle
-- Detalle legible de conflictos docentes para el tablero de horarios.
-- Unifica los tres tipos de conflicto en una sola tabla de filas
-- (docente_id, docente_nombre, detalle_linea).
--
-- Propósito: Alimentar ParallelRepository.obtenerDocentesConflictosDetalleDashboard()
--
-- Depende de (ejecutar antes):
--   94-vista-base-dashboard-detalle-conflicto-docente-horario.sql
--   95-vista-base-dashboard-detalle-conflicto-docente-aula.sql
--   96-vista-base-dashboard-detalle-conflicto-docente-duplicado.sql
--
-- Uso:
--   SELECT docente_id, docente_nombre, detalle_linea
--   FROM vista_dashboard_docentes_conflictos_detalle
--   ORDER BY docente_nombre ASC, detalle_linea ASC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_dashboard_docentes_conflictos_detalle;

CREATE VIEW vista_dashboard_docentes_conflictos_detalle AS
SELECT
  docente_id,
  docente_nombre COLLATE utf8mb4_unicode_ci AS docente_nombre,
  detalle_linea COLLATE utf8mb4_unicode_ci AS detalle_linea
FROM vista_base_dashboard_detalle_conflicto_docente_horario
UNION ALL
SELECT
  docente_id,
  docente_nombre COLLATE utf8mb4_unicode_ci,
  detalle_linea COLLATE utf8mb4_unicode_ci
FROM vista_base_dashboard_detalle_conflicto_docente_aula
UNION ALL
SELECT
  docente_id,
  docente_nombre COLLATE utf8mb4_unicode_ci,
  detalle_linea COLLATE utf8mb4_unicode_ci
FROM vista_base_dashboard_detalle_conflicto_docente_duplicado;
