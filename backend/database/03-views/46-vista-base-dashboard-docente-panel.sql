-- ============================================
-- VISTA BASE: vista_base_dashboard_docente_panel
-- Docentes activos para tarjetas “Últimos docentes” del dashboard.
-- Consumida por: DashboardRepository
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_docente_panel;

CREATE VIEW vista_base_dashboard_docente_panel AS
SELECT
    d.id,
    TRIM(CONCAT(COALESCE(d.apellido_paterno, ''), ' ', COALESCE(d.apellido_materno, ''), ' ', COALESCE(d.nombres, ''))) AS nombre_completo,
    d.titulo_profesional,
    CONCAT('DOCENTE-', d.id) AS avatar_seed,
    d.created_at,
    d.anios_experiencia,
    d.estado_laboral
FROM docentes d
WHERE d.deleted_at IS NULL
  AND d.activo = TRUE
  AND d.estado_laboral = 'ACTIVO';
