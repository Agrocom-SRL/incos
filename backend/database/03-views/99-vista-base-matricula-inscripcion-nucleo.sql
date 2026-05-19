-- ============================================
-- VISTA BASE: vista_base_matricula_inscripcion_nucleo
-- Torso del listado: inscripción + estudiante + carrera académica + gestión.
--
-- Reutiliza: vista_base_inscripciones_estudiantes (03)
-- Consumida por: vista_base_matricula_resumen_inscripcion
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_matricula_inscripcion_nucleo;

CREATE VIEW vista_base_matricula_inscripcion_nucleo AS
SELECT
  vie.inscripcion_id,
  vie.datos_academicos_id,
  vie.gestion_id,
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,

  vie.tipo_inscripcion,
  vie.fecha_inscripcion,

  vie.estudiante_id,
  vie.codigo_estudiante,
  vie.nombres,
  vie.apellido_paterno,
  vie.apellido_materno,
  vie.ci,
  vie.expedicion,
  TRIM(
    CONCAT_WS(
      ' ',
      COALESCE(vie.nombres, ''),
      COALESCE(vie.apellido_paterno, ''),
      COALESCE(vie.apellido_materno, '')
    )
  ) AS estudiante_nombre_completo,

  vie.carrera_id,
  c.codigo AS carrera_codigo,
  c.nombre AS carrera_nombre,

  i.activo,
  i.created_at,
  i.updated_at

FROM vista_base_inscripciones_estudiantes vie

INNER JOIN inscripciones i
  ON i.id = vie.inscripcion_id
  AND i.activo = TRUE
  AND i.deleted_at IS NULL

LEFT JOIN gestiones g
  ON g.id = vie.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL

LEFT JOIN carreras c
  ON c.id = vie.carrera_id
  AND c.activo = TRUE
  AND c.deleted_at IS NULL;
