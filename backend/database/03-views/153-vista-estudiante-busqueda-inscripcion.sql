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
-- 2026-08-13 (ajuste aditivo, rediseño wizard matrícula): se exponen
-- datos_academicos_id, carrera_id y tipo_admision (fila académica activa más
-- reciente del estudiante) y total_inscripciones (COUNT de inscripciones
-- activas del estudiante en CUALQUIER gestión, subconsulta agregada por
-- estudiante para no multiplicar filas). total_inscripciones = 0 identifica a
-- los estudiantes completamente nuevos en el sistema (modo solo_nuevos del
-- endpoint GET /estudiantes/buscar-para-inscripcion). Consumidores previos
-- (StudentRepository.buscarParaInscripcion) no se ven afectados.
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
  eda.id AS datos_academicos_id,
  eda.carrera_id AS carrera_id,
  eda.tipo_admision AS tipo_admision,
  COALESCE(tot.total_inscripciones, 0) AS total_inscripciones,
  ig.inscripcion_id AS inscripcion_gestion_actual_id,
  ig.gestion_anio AS inscripcion_gestion_actual_anio,
  ig.gestion_nombre AS inscripcion_gestion_actual_nombre
FROM vista_estudiante_datos_personales v
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = v.id
-- Fila académica activa más reciente por estudiante (1 fila, no multiplica)
LEFT JOIN (
  SELECT
    eda2.estudiante_id,
    MAX(eda2.id) AS datos_academicos_id
  FROM estudiantes_datos_academicos eda2
  WHERE eda2.deleted_at IS NULL
    AND eda2.activo = TRUE
  GROUP BY eda2.estudiante_id
) eda_ult ON eda_ult.estudiante_id = v.id
LEFT JOIN estudiantes_datos_academicos eda ON eda.id = eda_ult.datos_academicos_id
-- Total de inscripciones activas del estudiante en CUALQUIER gestión
-- (agregada por estudiante: 1 fila por estudiante, no multiplica)
LEFT JOIN (
  SELECT
    eda3.estudiante_id,
    COUNT(*) AS total_inscripciones
  FROM inscripciones i2
  INNER JOIN estudiantes_datos_academicos eda3 ON eda3.id = i2.datos_academicos_id
  WHERE i2.activo = TRUE
    AND i2.deleted_at IS NULL
    AND eda3.deleted_at IS NULL
  GROUP BY eda3.estudiante_id
) tot ON tot.estudiante_id = v.id
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
