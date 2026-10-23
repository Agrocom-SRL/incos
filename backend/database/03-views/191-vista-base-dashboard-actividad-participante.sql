-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_participante
-- Fila de actividad “nuevo participante” de capacitación para el dashboard
-- (contrato de 10 columnas del feed, ver 149).
-- Alcance por actor: estudiante_id y docente_id van en NULL (los portales del
-- estudiante y del docente filtran por esas columnas y no ven esta actividad).
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_participante;

CREATE VIEW vista_base_dashboard_actividad_participante AS
SELECT
    'PARTICIPANTE' AS artefacto_tipo,
    p.id AS artefacto_id,
    CONCAT('/capacitacion/participantes/', p.id) AS link_path,
    TRIM(CONCAT(COALESCE(p.apellido_paterno, ''), ' ', COALESCE(p.apellido_materno, ''), ' ', COALESCE(p.nombres, ''))) AS titulo,
    CONCAT('Nuevo participante · CI ', p.ci) AS detalle,
    CONCAT('PARTICIPANTE-', p.id) AS avatar_seed,
    p.created_at AS ocurrido_en,
    CAST(NULL AS SIGNED) AS estudiante_id,
    CAST(NULL AS SIGNED) AS docente_id,
    p.created_by AS usuario_id
FROM participantes p
WHERE p.deleted_at IS NULL
  AND p.activo = TRUE;
