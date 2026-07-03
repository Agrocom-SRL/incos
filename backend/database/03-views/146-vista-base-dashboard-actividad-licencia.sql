-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_licencia
-- Fila de actividad “licencia estudiantil” (solicitud/decisión).
--
-- Propósito:
-- - Normalizar una licencia estudiantil como actividad reciente del dashboard.
-- - Contrato de 10 columnas del feed: artefacto_tipo, artefacto_id, link_path,
--   titulo, detalle, avatar_seed, ocurrido_en, estudiante_id, docente_id, usuario_id.
--
-- Alcance:
-- - estudiante_id: el estudiante de la inscripción (feed del portal del estudiante).
-- - docente_id: NULL (la licencia cubre todas las materias de la inscripción).
-- - usuario_id: quien registró la solicitud (licencias.created_by; puede ser
--   el docente desde su planilla o staff académico).
--
-- Dependencias:
-- - licencias
-- - vista_base_inscripciones_estudiantes (03)
--
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_licencia;

CREATE VIEW vista_base_dashboard_actividad_licencia AS
SELECT
  'LICENCIA' AS artefacto_tipo,
  l.id AS artefacto_id,
  '/academico/asistencia/licencias/listar' AS link_path,
  TRIM(CONCAT_WS(' ', vie.apellido_paterno, vie.apellido_materno, vie.nombres)) AS titulo,
  CONCAT(
    'Licencia ', l.motivo,
    ' · ', l.estado,
    ' · ', DATE_FORMAT(l.fecha_inicio, '%d/%m'), '–', DATE_FORMAT(l.fecha_fin, '%d/%m'),
    ' · ', COALESCE(l.total_dias, DATEDIFF(l.fecha_fin, l.fecha_inicio) + 1), ' día(s)'
  ) AS detalle,
  CONCAT('LICENCIA-', l.id) AS avatar_seed,
  COALESCE(l.updated_at, l.created_at) AS ocurrido_en,
  vie.estudiante_id,
  CAST(NULL AS SIGNED) AS docente_id,
  l.created_by AS usuario_id
FROM licencias l
INNER JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = l.inscripcion_id
WHERE l.deleted_at IS NULL
  AND l.activo = TRUE;
