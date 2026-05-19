-- ============================================
-- VISTA BASE: vista_base_matricula_resumen_inscripcion
-- Vista principal del listado de matrícula (API GET /v1/inscripciones).
--
-- Bloques:
-- - 99 vista_base_matricula_inscripcion_nucleo
-- - 100 vista_base_matricula_inscripcion_paralelo
-- - 97 vista_base_matricula_conteo_materias
-- - 98 vista_base_matricula_conteo_historial_previo
--
-- Uso:
-- SELECT * FROM vista_base_matricula_resumen_inscripcion
-- WHERE carrera_id = 1 AND paralelo_id = 5
-- ORDER BY fecha_inscripcion DESC LIMIT 50;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_matricula_listado;
DROP VIEW IF EXISTS vista_base_matricula_resumen_inscripcion;

CREATE VIEW vista_base_matricula_resumen_inscripcion AS
SELECT
  n.inscripcion_id,
  n.datos_academicos_id,
  n.gestion_id,
  n.gestion_nombre,
  n.gestion_anio,

  n.tipo_inscripcion,
  n.fecha_inscripcion,

  n.estudiante_id,
  n.codigo_estudiante,
  n.nombres AS estudiante_nombres,
  n.apellido_paterno AS estudiante_apellido_paterno,
  n.apellido_materno AS estudiante_apellido_materno,
  n.ci AS estudiante_ci,
  n.expedicion AS estudiante_expedicion,
  n.estudiante_nombre_completo,

  n.carrera_id,
  n.carrera_codigo,
  n.carrera_nombre,

  p.paralelo_id,
  p.paralelo_nombre,
  p.paralelo_turno,
  p.paralelo_descripcion,
  p.periodo_id,
  p.periodo_numero,
  p.periodo_nombre,

  COALESCE(mm.cantidad_materias, 0) AS cantidad_materias,
  COALESCE(hp.cantidad_historial_previo, 0) AS cantidad_historial_previo,

  CASE
    WHEN n.tipo_inscripcion IN ('ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD') THEN TRUE
    ELSE FALSE
  END AS requiere_historial_previo,

  CASE
    WHEN n.tipo_inscripcion NOT IN ('ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD') THEN 'NO_APLICA'
    WHEN COALESCE(hp.cantidad_historial_previo, 0) > 0 THEN 'REGISTRADO'
    ELSE 'PENDIENTE'
  END AS historial_previo_estado,

  n.activo,
  n.created_at,
  n.updated_at

FROM vista_base_matricula_inscripcion_nucleo n

LEFT JOIN vista_base_matricula_inscripcion_paralelo p
  ON p.inscripcion_id = n.inscripcion_id

LEFT JOIN vista_base_matricula_conteo_materias mm
  ON mm.inscripcion_id = n.inscripcion_id

LEFT JOIN vista_base_matricula_conteo_historial_previo hp
  ON hp.inscripcion_id = n.inscripcion_id;
