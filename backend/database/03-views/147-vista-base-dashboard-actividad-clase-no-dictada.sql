-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_clase_no_dictada
-- Fila de actividad “clase no dictada” (cancelación puntual del dictado).
--
-- Propósito:
-- - Normalizar una cancelación de clase como actividad reciente del feed docente.
-- - Contrato de 10 columnas del feed: artefacto_tipo, artefacto_id, link_path,
--   titulo, detalle, avatar_seed, ocurrido_en, estudiante_id, docente_id, usuario_id.
--
-- Alcance:
-- - docente_id: el docente del curso afectado (feed del portal del docente).
-- - estudiante_id: NULL (la cancelación es por curso, no por estudiante).
-- - usuario_id: quien registró la cancelación (clases_no_dictadas.created_by).
--
-- Dependencias:
-- - clases_no_dictadas
-- - vista_base_docente_asignaciones_curso (51)
--
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_clase_no_dictada;

CREATE VIEW vista_base_dashboard_actividad_clase_no_dictada AS
SELECT
  'CLASE_NO_DICTADA' AS artefacto_tipo,
  cnd.id AS artefacto_id,
  '/academico/asistencia/clases-no-dictadas' AS link_path,
  CONCAT(
    COALESCE(adc.materia_nombre, adc.materia_sigla, 'Curso'),
    ' · Paralelo ',
    COALESCE(adc.paralelo_nombre, '')
  ) AS titulo,
  CONCAT(
    'Clase no dictada · ',
    DATE_FORMAT(cnd.fecha_clase, '%d/%m/%Y'),
    ' · ',
    cnd.motivo
  ) AS detalle,
  CONCAT('CLASE_NO_DICTADA-', cnd.id) AS avatar_seed,
  cnd.created_at AS ocurrido_en,
  CAST(NULL AS SIGNED) AS estudiante_id,
  adc.docente_id,
  cnd.created_by AS usuario_id
FROM clases_no_dictadas cnd
INNER JOIN vista_base_docente_asignaciones_curso adc
  ON adc.asignacion_docente_id = cnd.asignacion_docente_id
WHERE cnd.deleted_at IS NULL
  AND cnd.activo = TRUE;
