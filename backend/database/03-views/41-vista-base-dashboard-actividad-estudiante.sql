-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_estudiante
-- Fila de actividad “nuevo estudiante” para el dashboard (columnas normalizadas).
-- avatar_seed: clave para avatar ilustrado en el cliente (URL), no emoji en BD.
-- Columnas de alcance (contrato de 10 columnas del feed):
--   estudiante_id / docente_id / usuario_id permiten filtrar el feed global
--   por actor (portal del estudiante y portal del docente).
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
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
    est.created_at AS ocurrido_en,
    est.id AS estudiante_id,
    CAST(NULL AS SIGNED) AS docente_id,
    est.created_by AS usuario_id
FROM estudiantes est
WHERE est.deleted_at IS NULL
  AND est.activo = TRUE;
