-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_beca
-- Fila de actividad “beca asignada” para el dashboard.
-- Contrato de 10 columnas del feed (incluye estudiante_id/docente_id/usuario_id).
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_beca;

CREATE VIEW vista_base_dashboard_actividad_beca AS
SELECT
    'BECA_ASIGNADA' AS artefacto_tipo,
    eb.id AS artefacto_id,
    CONCAT('/estudiantes/becas/asignacion/', eb.id) AS link_path,
    TRIM(CONCAT(COALESCE(est.apellido_paterno, ''), ' ', COALESCE(est.apellido_materno, ''), ' ', COALESCE(est.nombres, ''))) AS titulo,
    CONCAT(
        'Beca asignada · ',
        COALESCE(bd.nombre, 'Beca'),
        ' · ',
        COALESCE(eb.estado, '')
    ) AS detalle,
    CONCAT('BECA_ASIGNADA-', eb.id) AS avatar_seed,
    eb.created_at AS ocurrido_en,
    eb.estudiante_id,
    CAST(NULL AS SIGNED) AS docente_id,
    eb.created_by AS usuario_id
FROM estudiantes_becas eb
INNER JOIN estudiantes est
    ON est.id = eb.estudiante_id
    AND est.deleted_at IS NULL
    AND est.activo = TRUE
LEFT JOIN becas_descuentos bd
    ON bd.id = eb.beca_descuento_id
    AND bd.deleted_at IS NULL
WHERE eb.deleted_at IS NULL
  AND eb.activo = TRUE;
