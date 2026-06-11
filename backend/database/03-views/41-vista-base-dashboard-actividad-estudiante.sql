-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_estudiante
-- Fila de actividad “nuevo estudiante” para el dashboard (columnas normalizadas).
-- avatar_seed: clave para avatar ilustrado en el cliente (URL), no emoji en BD.
-- Consumida por: 45-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_estudiante;

CREATE VIEW vista_base_dashboard_actividad_estudiante AS
SELECT
    'ESTUDIANTE' AS artefacto_tipo,
    est.id AS artefacto_id,
    CONCAT('/estudiantes/', est.id) AS link_path,
    TRIM(CONCAT(COALESCE(est.apellido_paterno, ''), ' ', COALESCE(est.apellido_materno, ''), ' ', COALESCE(est.nombres, ''))) AS titulo,
    CONCAT('Nuevo estudiante · código ', est.codigo_estudiante) AS detalle,
    CONCAT('ESTUDIANTE-', est.id) AS avatar_seed,
    est.created_at AS ocurrido_en
FROM estudiantes est
WHERE est.deleted_at IS NULL
  AND est.activo = TRUE;
