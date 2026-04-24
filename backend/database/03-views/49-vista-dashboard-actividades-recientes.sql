-- ============================================
-- VISTA: vista_dashboard_actividades_recientes
-- Unión de las vistas base de actividad del dashboard.
-- Orden en consulta (app): priorizar hoy y luego ocurrido_en DESC; ver DashboardRepository.
--
-- Dependencias (ejecutar antes en este orden):
-- - 41-vista-base-dashboard-actividad-estudiante.sql
-- - 03-vista-base-inscripciones-estudiantes.sql
-- - 42-vista-base-dashboard-actividad-inscripcion.sql
-- - 43-vista-base-dashboard-actividad-pago-cuota.sql
-- - 44-vista-base-dashboard-actividad-docente.sql
-- - 47-vista-base-dashboard-actividad-beca.sql
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
