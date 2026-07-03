-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_asistencia_tomada
-- Fila de actividad “asistencia tomada” (sesión de clase registrada).
--
-- Propósito:
-- - Normalizar cada sesión de clase (1 curso × 1 fecha) como actividad
--   reciente del feed del docente.
-- - Contrato de 10 columnas del feed: artefacto_tipo, artefacto_id, link_path,
--   titulo, detalle, avatar_seed, ocurrido_en, estudiante_id, docente_id, usuario_id.
--
-- Alcance:
-- - docente_id: el docente del curso (feed del portal del docente).
-- - estudiante_id: NULL (la sesión es del curso, no de un estudiante).
-- - usuario_id: quien registró la sesión (sesiones_clase.created_by).
--
-- Dependencias:
-- - sesiones_clase
-- - vista_base_docente_asignaciones_curso (51)
--
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_asistencia_tomada;

CREATE VIEW vista_base_dashboard_actividad_asistencia_tomada AS
SELECT
  'ASISTENCIA_TOMADA' AS artefacto_tipo,
  sc.id AS artefacto_id,
  CONCAT('/academico/asistencia/mis-cursos/', sc.asignacion_docente_id, '/planilla') AS link_path,
  CONCAT(
    COALESCE(adc.materia_nombre, adc.materia_sigla, 'Curso'),
    ' · Paralelo ',
    COALESCE(adc.paralelo_nombre, '')
  ) AS titulo,
  CONCAT(
    'Asistencia tomada · ',
    DATE_FORMAT(sc.fecha, '%d/%m/%Y'),
    CASE WHEN sc.es_especial = TRUE THEN ' · sesión especial' ELSE '' END
  ) AS detalle,
  CONCAT('ASISTENCIA_TOMADA-', sc.id) AS avatar_seed,
  sc.created_at AS ocurrido_en,
  CAST(NULL AS SIGNED) AS estudiante_id,
  adc.docente_id,
  sc.created_by AS usuario_id
FROM sesiones_clase sc
INNER JOIN vista_base_docente_asignaciones_curso adc
  ON adc.asignacion_docente_id = sc.asignacion_docente_id
WHERE sc.deleted_at IS NULL
  AND sc.activo = TRUE;
