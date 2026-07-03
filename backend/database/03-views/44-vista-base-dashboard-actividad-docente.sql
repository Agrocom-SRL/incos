-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_docente
-- Fila de actividad “alta de docente” para el dashboard (columnas normalizadas).
-- Contrato de 10 columnas del feed (incluye estudiante_id/docente_id/usuario_id).
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_docente;

CREATE VIEW vista_base_dashboard_actividad_docente AS
SELECT
    'DOCENTE' AS artefacto_tipo,
    d.id AS artefacto_id,
    '/docentes/listar' AS link_path,
    TRIM(CONCAT(COALESCE(d.apellido_paterno, ''), ' ', COALESCE(d.apellido_materno, ''), ' ', COALESCE(d.nombres, ''))) AS titulo,
    CONCAT('Alta de docente · ', COALESCE(NULLIF(TRIM(d.titulo_profesional), ''), 'Sin título declarado')) AS detalle,
    CONCAT('DOCENTE-', d.id) AS avatar_seed,
    d.created_at AS ocurrido_en,
    CAST(NULL AS SIGNED) AS estudiante_id,
    d.id AS docente_id,
    d.created_by AS usuario_id
FROM docentes d
WHERE d.deleted_at IS NULL
  AND d.activo = TRUE;
