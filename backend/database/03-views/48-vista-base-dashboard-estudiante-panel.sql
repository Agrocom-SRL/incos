-- ============================================
-- VISTA BASE: vista_base_dashboard_estudiante_panel
-- Estudiantes activos para tarjetas “Últimos estudiantes” del dashboard.
-- Consumida por: DashboardRepository
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_estudiante_panel;

CREATE VIEW vista_base_dashboard_estudiante_panel AS
SELECT
    est.id,
    TRIM(CONCAT(COALESCE(est.nombres, ''), ' ', COALESCE(est.apellido_paterno, ''), ' ', COALESCE(est.apellido_materno, ''))) AS nombre_completo,
    est.codigo_estudiante,
    CONCAT('ESTUDIANTE-', est.id) AS avatar_seed,
    est.created_at
FROM estudiantes est
WHERE est.deleted_at IS NULL
  AND est.activo = TRUE;
