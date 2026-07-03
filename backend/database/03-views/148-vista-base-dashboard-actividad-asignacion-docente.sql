-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_asignacion_docente
-- Fila de actividad “asignación docente vigente” (docente ↔ oferta de curso).
--
-- Propósito:
-- - Normalizar la asignación vigente de un docente a un curso como actividad
--   reciente del feed del docente.
-- - Contrato de 10 columnas del feed: artefacto_tipo, artefacto_id, link_path,
--   titulo, detalle, avatar_seed, ocurrido_en, estudiante_id, docente_id, usuario_id.
--
-- Alcance:
-- - docente_id: el docente asignado (feed del portal del docente).
-- - estudiante_id / usuario_id: NULL (acto administrativo institucional).
--
-- Dependencias:
-- - vista_base_asignacion_docente_detalle (130)
--
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_asignacion_docente;

CREATE VIEW vista_base_dashboard_actividad_asignacion_docente AS
SELECT
  'ASIGNACION_DOCENTE' AS artefacto_tipo,
  vad.id AS artefacto_id,
  '/institucional/horarios/asignacion-docente' AS link_path,
  TRIM(CONCAT_WS(' ',
    vad.docente_apellido_paterno,
    vad.docente_apellido_materno,
    vad.docente_nombres
  )) AS titulo,
  CONCAT(
    'Asignación de curso · ',
    TRIM(CONCAT_WS(' ', vad.materia_sigla, vad.materia_nombre)),
    ' · Paralelo ',
    COALESCE(vad.paralelo_nombre, '')
  ) AS detalle,
  CONCAT('ASIGNACION_DOCENTE-', vad.id) AS avatar_seed,
  COALESCE(vad.created_at, vad.fecha_asignacion) AS ocurrido_en,
  CAST(NULL AS SIGNED) AS estudiante_id,
  vad.docente_id,
  CAST(NULL AS SIGNED) AS usuario_id
FROM vista_base_asignacion_docente_detalle vad
WHERE vad.activo = TRUE
  AND vad.vigente = TRUE
  AND vad.docente_id IS NOT NULL;
