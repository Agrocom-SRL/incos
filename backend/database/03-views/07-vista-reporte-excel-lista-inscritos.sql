-- ============================================
-- VISTA: vista_reporte_excel_lista_inscritos
-- Vista para exportar la lista de estudiantes inscritos (por carrera y paralelo) en una gestión.
--
-- Objetivo:
-- - Una fila por inscripción (estudiante) y paralelo (sin duplicar por materia).
-- - Campos mínimos para el Excel:
--   nombre completo, celular, CI, sexo, observaciones, carrera/paralelo/gestión.
--
-- Uso:
-- SELECT * FROM vista_reporte_excel_lista_inscritos WHERE gestion_id = 2 AND carrera_id = 1
-- ORDER BY paralelo_nombre, apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_reporte_excel_lista_inscritos;

CREATE VIEW vista_reporte_excel_lista_inscritos AS
SELECT DISTINCT
  vie.gestion_id,
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,

  vip.carrera_id,
  vip.carrera_nombre,
  vip.carrera_codigo,

  vip.periodo_id,
  vip.periodo_numero,
  vip.periodo_nombre,

  vip.paralelo_id,
  vip.paralelo_nombre,
  vip.paralelo_turno,
  vip.paralelo_descripcion,

  vie.inscripcion_id,
  vie.estudiante_id,
  vie.codigo_estudiante,

  est.apellido_paterno,
  est.apellido_materno,
  est.nombres,
  CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres) AS nombre_completo,

  est.ci,
  est.expedicion,
  CASE
    WHEN est.genero = 'MASCULINO' THEN 'M'
    WHEN est.genero = 'FEMENINO' THEN 'F'
    ELSE NULL
  END AS sexo,
  est.celular,

  i.observaciones AS observaciones
FROM vista_base_inscripciones_estudiantes vie
INNER JOIN gestiones g ON g.id = vie.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
INNER JOIN inscripciones i ON i.id = vie.inscripcion_id
  AND i.activo = TRUE
  AND i.deleted_at IS NULL
INNER JOIN estudiantes est ON est.id = vie.estudiante_id
  AND est.activo = TRUE
  AND est.deleted_at IS NULL
INNER JOIN vista_base_inscripciones_paralelos vip ON vip.inscripcion_id = vie.inscripcion_id;

