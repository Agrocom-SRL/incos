-- ============================================
-- VISTA BASE: vista_base_inscripciones_estudiantes
-- Información de inscripciones con datos de estudiantes
-- 
-- Propósito: Vista base que une inscripciones + estudiantes_datos_academicos + estudiantes (3 tablas)
-- Reutilizable para construir vistas más complejas
-- 
-- Relaciones según schemas:
-- - inscripciones.estudiante_datos_academicos_id → estudiantes_datos_academicos.id
-- - estudiantes_datos_academicos.estudiante_id → estudiantes.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_inscripciones_estudiantes;

CREATE VIEW vista_base_inscripciones_estudiantes AS
SELECT 
  i.id AS inscripcion_id,
  i.estudiante_datos_academicos_id,
  i.gestion_id,
  i.tipo_inscripcion,
  i.fecha_inscripcion,
  eda.estudiante_id,
  eda.carrera_id,
  eda.gestion_ingreso_id,
  est.codigo_estudiante,
  est.nombres,
  est.apellido_paterno,
  est.apellido_materno,
  est.genero,
  est.ci,
  est.expedicion
FROM inscripciones i
INNER JOIN estudiantes_datos_academicos eda ON eda.id = i.estudiante_datos_academicos_id
  AND eda.activo = TRUE 
  AND eda.deleted_at IS NULL
INNER JOIN estudiantes est ON est.id = eda.estudiante_id
  AND est.activo = TRUE 
  AND est.deleted_at IS NULL
WHERE i.activo = TRUE 
  AND i.deleted_at IS NULL;
