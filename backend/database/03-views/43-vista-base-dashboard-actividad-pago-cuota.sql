-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_pago_cuota
-- Fila de actividad “pago de aporte” para el dashboard (columnas normalizadas).
-- Contrato de 10 columnas del feed (incluye estudiante_id/docente_id/usuario_id).
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_pago_cuota;

CREATE VIEW vista_base_dashboard_actividad_pago_cuota AS
SELECT
    'PAGO_CUOTA' AS artefacto_tipo,
    pc.id AS artefacto_id,
    CONCAT('/pagos/', pa.id) AS link_path,
    TRIM(CONCAT(COALESCE(est.apellido_paterno, ''), ' ', COALESCE(est.apellido_materno, ''), ' ', COALESCE(est.nombres, ''))) AS titulo,
    CONCAT('Pago de aporte · recibo ', pc.numero_recibo, ' · Bs. ', pc.monto) AS detalle,
    CONCAT('PAGO_CUOTA-', pc.id) AS avatar_seed,
    pc.created_at AS ocurrido_en,
    pa.estudiante_id,
    CAST(NULL AS SIGNED) AS docente_id,
    pc.created_by AS usuario_id
FROM pago_cuotas pc
INNER JOIN pago_aporte pa
    ON pa.id = pc.pago_aporte_id
    AND pa.deleted_at IS NULL
    AND pa.activo = TRUE
INNER JOIN estudiantes est
    ON est.id = pa.estudiante_id
    AND est.deleted_at IS NULL
    AND est.activo = TRUE
WHERE pc.deleted_at IS NULL
  AND pc.activo = TRUE;
