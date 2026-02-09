-- ============================================
-- VISTA: vista_estudiante_datos_academicos
-- Cuerpo completo: datos académicos del estudiante (carrera, gestión_ingreso, estado)
--
-- Propósito: Une el torso (estudiantes_datos_academicos) con carreras y gestiones.
-- Expone datos académicos básicos del estudiante: carrera, gestión_ingreso, estado_academico, etc.
-- NO incluye datos de inscripciones (paralelo, periodo, materias).
--
-- Uso:
-- SELECT * FROM vista_estudiante_datos_academicos WHERE estudiante_id = ?;
-- SELECT * FROM vista_estudiante_datos_academicos WHERE codigo_estudiante = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_datos_academicos;

CREATE VIEW vista_estudiante_datos_academicos AS
SELECT
  -- Torso: estudiantes_datos_academicos
  eda.id AS estudiante_datos_academicos_id,
  eda.estudiante_id,
  eda.carrera_id,
  eda.gestion_ingreso_id,
  eda.estado_academico,
  eda.estado_registro,
  eda.tipo_admision,
  eda.promedio_anual,
  eda.foto_url,
  -- Estudiante básico (para filtros)
  est.codigo_estudiante,
  est.ci,
  est.expedicion,
  -- Carrera
  car.nombre AS carrera_nombre,
  car.codigo AS carrera_codigo,
  car.descripcion AS carrera_descripcion,
  car.area_formacion AS carrera_area_formacion,
  car.titulo_otorgado AS carrera_titulo_otorgado,
  -- Gestión de ingreso
  g.nombre AS gestion_ingreso_nombre,
  g.anio AS gestion_ingreso_anio,
  g.vigente AS gestion_ingreso_vigente
FROM estudiantes_datos_academicos eda
INNER JOIN estudiantes est ON est.id = eda.estudiante_id
  AND est.activo = TRUE
  AND est.deleted_at IS NULL
LEFT JOIN carreras car ON car.id = eda.carrera_id
  AND car.activo = TRUE
  AND car.deleted_at IS NULL
LEFT JOIN gestiones g ON g.id = eda.gestion_ingreso_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
WHERE eda.activo = TRUE
  AND eda.deleted_at IS NULL;
