-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_inscripcion
-- Fila de actividad “matrícula / inscripción” para el dashboard (columnas normalizadas).
-- Dependencia: 03-vista-base-inscripciones-estudiantes.sql (vista_base_inscripciones_estudiantes)
-- Consumida por: 45-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_inscripcion;

CREATE VIEW vista_base_dashboard_actividad_inscripcion AS
SELECT
    'INSCRIPCION' AS artefacto_tipo,
    vb.inscripcion_id AS artefacto_id,
    CONCAT('/inscripciones/', vb.inscripcion_id) AS link_path,
    TRIM(CONCAT(COALESCE(vb.nombres, ''), ' ', COALESCE(vb.apellido_paterno, ''), ' ', COALESCE(vb.apellido_materno, ''))) AS titulo,
    CONCAT(
        'Nueva matrícula · ',
        COALESCE(i.tipo_inscripcion, ''),
        COALESCE(CONCAT(' · ', g.nombre), '')
    ) AS detalle,
    CONCAT('INSCRIPCION-', vb.inscripcion_id) AS avatar_seed,
    COALESCE(i.updated_at, i.created_at) AS ocurrido_en
FROM vista_base_inscripciones_estudiantes vb
INNER JOIN inscripciones i
    ON i.id = vb.inscripcion_id
    AND i.deleted_at IS NULL
    AND i.activo = TRUE
LEFT JOIN gestiones g
    ON g.id = vb.gestion_id
    AND g.deleted_at IS NULL;
