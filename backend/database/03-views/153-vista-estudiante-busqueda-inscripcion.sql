-- ============================================
-- VISTA: vista_estudiante_busqueda_inscripcion
-- Filas para búsqueda / muestra previa al matricular (wizard Inscripción nueva).
--
-- Propósito: Une datos personales (15) con carrera reciente (38) y expone si el
-- estudiante YA tiene una inscripción activa en la gestión vigente (campo aditivo:
-- NO excluye del resultado, porque el operador puede buscar sin saber si el
-- estudiante ya está matriculado). El backend prioriza en el ORDER BY a los NO
-- matriculados (mismo patrón que vista_estudiante_busqueda_registro_aporte, 39).
--
-- Dependencias (orden sugerido):
-- 1. 15-vista-estudiante-datos-personales.sql
-- 2. 38-vista-base-estudiante-carrera-reciente.sql
-- 3. 10-estudiantes-parte1.sql (estudiantes_datos_academicos),
--    13-inscripciones.sql (inscripciones), 07-estructura-academica-parte3.sql (gestiones)
-- 4. Esta vista
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_busqueda_inscripcion;

CREATE VIEW vista_estudiante_busqueda_inscripcion AS
SELECT
  v.id,
  v.codigo_estudiante,
  v.nombres,
  v.apellido_paterno,
  v.apellido_materno,
  v.email_personal,
  v.celular,
  v.telefono_fijo,
  v.ci,
  v.expedicion,
  v.created_at,
  v.activo,
  cr.carrera_nombre,
  cr.carrera_codigo,
  ig.inscripcion_id AS inscripcion_gestion_actual_id,
  ig.gestion_anio AS inscripcion_gestion_actual_anio,
  ig.gestion_nombre AS inscripcion_gestion_actual_nombre
FROM vista_estudiante_datos_personales v
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = v.id
LEFT JOIN (
  SELECT
    eda.estudiante_id,
    i.id AS inscripcion_id,
    g.anio AS gestion_anio,
    g.nombre AS gestion_nombre
  FROM inscripciones i
  INNER JOIN estudiantes_datos_academicos eda ON eda.id = i.datos_academicos_id
  INNER JOIN gestiones g
    ON g.id = i.gestion_id
    AND g.vigente = TRUE
    AND g.activo = TRUE
    AND g.deleted_at IS NULL
  WHERE i.activo = TRUE
    AND i.deleted_at IS NULL
    AND eda.deleted_at IS NULL
) ig ON ig.estudiante_id = v.id;
