-- ============================================
-- VISTA: vista_dashboard_actividades_recientes
-- Unión de las vistas base de actividad del dashboard.
--
-- Propósito:
-- - Centralizar en una sola vista las actividades recientes del sistema.
-- - La app puede ordenar priorizando actividades de hoy y luego ocurrido_en DESC.
--
-- Dependencias:
-- - vista_base_dashboard_actividad_estudiante
-- - vista_base_dashboard_actividad_inscripcion
-- - vista_base_dashboard_actividad_pago_cuota
-- - vista_base_dashboard_actividad_docente
-- - vista_base_dashboard_actividad_beca
--
-- Uso:
-- SELECT *
-- FROM vista_dashboard_actividades_recientes
-- ORDER BY ocurrido_en DESC;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_dashboard_actividades_recientes;

CREATE VIEW vista_dashboard_actividades_recientes AS
SELECT * FROM vista_base_dashboard_actividad_estudiante

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_inscripcion

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_pago_cuota

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_docente

UNION ALL

SELECT * FROM vista_base_dashboard_actividad_beca;