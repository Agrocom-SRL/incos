-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_inscripcion_capacitacion
-- Fila de actividad “nueva inscripción a capacitación” para el dashboard
-- (contrato de 10 columnas del feed, ver 149). Título = participante; detalle =
-- curso (y grupo si lo tiene).
-- Alcance por actor: estudiante_id y docente_id van en NULL.
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_inscripcion_capacitacion;

CREATE VIEW vista_base_dashboard_actividad_inscripcion_capacitacion AS
SELECT
    'INSCRIPCION_CAPACITACION' AS artefacto_tipo,
    ci.id AS artefacto_id,
    CONCAT('/capacitacion/inscripciones/', ci.id) AS link_path,
    TRIM(CONCAT(COALESCE(p.apellido_paterno, ''), ' ', COALESCE(p.apellido_materno, ''), ' ', COALESCE(p.nombres, ''))) AS titulo,
    CONCAT('Inscripción a ', cap.titulo, COALESCE(CONCAT(' · ', g.nombre), '')) AS detalle,
    CONCAT('INSCRIPCION-CAP-', ci.id) AS avatar_seed,
    ci.created_at AS ocurrido_en,
    CAST(NULL AS SIGNED) AS estudiante_id,
    CAST(NULL AS SIGNED) AS docente_id,
    ci.created_by AS usuario_id
FROM capacitacion_inscritos ci
INNER JOIN participantes p ON p.id = ci.participante_id
  AND p.deleted_at IS NULL
INNER JOIN capacitaciones cap ON cap.id = ci.capacitacion_id
  AND cap.deleted_at IS NULL
LEFT JOIN capacitacion_grupos g ON g.id = ci.capacitacion_grupo_id
  AND g.deleted_at IS NULL
WHERE ci.deleted_at IS NULL
  AND ci.activo = TRUE;
