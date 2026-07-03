-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_inscripcion
-- Fila de actividad “matrícula / inscripción” para el dashboard.
--
-- Propósito:
-- - Normalizar una inscripción como una actividad reciente del dashboard.
-- - Devuelve columnas comunes: artefacto_tipo, artefacto_id, link_path,
--   titulo, detalle, avatar_seed, ocurrido_en, estudiante_id, docente_id
--   y usuario_id (contrato de 10 columnas del feed).
--
-- Dependencias:
-- - vista_base_inscripciones_estudiantes
-- - inscripciones
-- - gestiones
--
-- Consumida por:
-- - vista_dashboard_actividades_recientes
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_inscripcion;

CREATE VIEW vista_base_dashboard_actividad_inscripcion AS
SELECT
  'INSCRIPCION' AS artefacto_tipo,
  vb.inscripcion_id AS artefacto_id,
  CONCAT('/inscripciones/', vb.inscripcion_id) AS link_path,

  TRIM(
    CONCAT(
      COALESCE(vb.apellido_paterno, ''),
      ' ',
      COALESCE(vb.apellido_materno, ''),
      ' ',
      COALESCE(vb.nombres, '')
    )
  ) AS titulo,

  CONCAT(
    'Nueva matrícula · ',
    COALESCE(i.tipo_inscripcion, ''),
    COALESCE(CONCAT(' · ', g.nombre), '')
  ) AS detalle,

  CONCAT('INSCRIPCION-', vb.inscripcion_id) AS avatar_seed,

  COALESCE(i.updated_at, i.created_at) AS ocurrido_en,

  vb.estudiante_id,
  CAST(NULL AS SIGNED) AS docente_id,
  i.created_by AS usuario_id

FROM vista_base_inscripciones_estudiantes vb

INNER JOIN inscripciones i
  ON i.id = vb.inscripcion_id
  AND i.deleted_at IS NULL
  AND i.activo = TRUE

LEFT JOIN gestiones g
  ON g.id = vb.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL;