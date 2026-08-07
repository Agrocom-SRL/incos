-- ============================================
-- VISTA BASE: vista_base_nivelacion_bandeja_fila
-- Bandeja PLANA de exámenes de nivelación PROGRAMADA/EN_CURSO, cruzando
-- TODOS los paralelos — pantalla Nivelaciones (ACA), landing de
-- `/academico/nivelaciones/aprobar` (B3).
--
-- Grano: una fila por `nivelaciones` (no por paralelo/materia como la 185):
-- ancla directa a `nivelaciones.historial_matricula_id` → `historial_matricula`
-- → estudiante + materia, sin pasar por el pivote de asignaturas del
-- paralelo actual (185) — evita su limitación conocida (evento sin columna
-- coincidente en el plan vigente): acá SIEMPRE aparece toda nivelación
-- PROGRAMADA/EN_CURSO, sin excepción.
--
-- DOS ramas (mismo anclaje mutuamente excluyente que la 185):
--   A) matricula_materia_id → materia cursada: sí se resuelve paralelo_gestion_id
--      (vía oferta_cursos), la nivelación se rinde sobre un curso activo.
--   B) inscripcion_id + asignatura_plan_id → materia arrastrada: SIN
--      paralelo_gestion_id (no hay oferta_curso para una materia que no se
--      cursa este año) — el frontend debe manejar el caso null.
--
-- Uso:
--   SELECT * FROM vista_base_nivelacion_bandeja_fila
--   WHERE nivelacion_estado IN ('PROGRAMADA','EN_CURSO')
--   ORDER BY nombre_completo, asignatura_sigla;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_nivelacion_bandeja_fila;

CREATE VIEW vista_base_nivelacion_bandeja_fila AS
-- Rama A: materia CURSADA (ancla directa).
SELECT
  niv.id                     AS nivelacion_id,
  niv.estado                 AS nivelacion_estado,
  niv.nota_nivelacion        AS nota_nivelacion,
  niv.aprobado                AS nivelacion_aprobada,
  niv.fecha_examen            AS fecha_examen,
  niv.docente_evaluador_id    AS docente_evaluador_id,
  niv.gestion_id              AS nivelacion_gestion_id,
  hm.id                       AS historial_matricula_id,
  hm.tipo_estado              AS tipo_estado,
  hm.fecha_transicion         AS fecha_transicion,
  hm.observaciones            AS historial_observaciones,
  hm.matricula_materia_id     AS matricula_materia_id,
  est.id                      AS estudiante_id,
  est.codigo_estudiante       AS codigo_estudiante,
  TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)) AS nombre_completo,
  mat.sigla                   AS asignatura_sigla,
  mat.nombre                  AS asignatura_nombre,
  oc.paralelo_gestion_id       AS paralelo_gestion_id
FROM nivelaciones niv
INNER JOIN historial_matricula hm
  ON hm.id = niv.historial_matricula_id
  AND hm.deleted_at IS NULL
INNER JOIN matriculas_materia mm
  ON mm.id = hm.matricula_materia_id
  AND mm.deleted_at IS NULL
INNER JOIN inscripciones ins
  ON ins.id = mm.inscripcion_id
  AND ins.deleted_at IS NULL
INNER JOIN estudiantes_datos_academicos eda
  ON eda.id = ins.datos_academicos_id
  AND eda.deleted_at IS NULL
INNER JOIN estudiantes est
  ON est.id = eda.estudiante_id
  AND est.deleted_at IS NULL
INNER JOIN oferta_cursos oc
  ON oc.id = mm.oferta_curso_id
  AND oc.deleted_at IS NULL
LEFT JOIN asignaturas_plan ap
  ON ap.id = oc.asignatura_plan_id
  AND ap.deleted_at IS NULL
LEFT JOIN materias mat
  ON mat.id = ap.materia_id
  AND mat.deleted_at IS NULL
WHERE niv.deleted_at IS NULL
  AND niv.activo = TRUE
  AND hm.matricula_materia_id IS NOT NULL

UNION ALL

-- Rama B: materia ARRASTRADA (ancla alterna). Sin paralelo_gestion_id.
SELECT
  niv.id,
  niv.estado,
  niv.nota_nivelacion,
  niv.aprobado,
  niv.fecha_examen,
  niv.docente_evaluador_id,
  niv.gestion_id,
  hm.id,
  hm.tipo_estado,
  hm.fecha_transicion,
  hm.observaciones,
  NULL,
  est.id,
  est.codigo_estudiante,
  TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)),
  mat.sigla,
  mat.nombre,
  NULL
FROM nivelaciones niv
INNER JOIN historial_matricula hm
  ON hm.id = niv.historial_matricula_id
  AND hm.deleted_at IS NULL
INNER JOIN inscripciones ins
  ON ins.id = hm.inscripcion_id
  AND ins.deleted_at IS NULL
INNER JOIN estudiantes_datos_academicos eda
  ON eda.id = ins.datos_academicos_id
  AND eda.deleted_at IS NULL
INNER JOIN estudiantes est
  ON est.id = eda.estudiante_id
  AND est.deleted_at IS NULL
INNER JOIN asignaturas_plan ap
  ON ap.id = hm.asignatura_plan_id
  AND ap.deleted_at IS NULL
LEFT JOIN materias mat
  ON mat.id = ap.materia_id
  AND mat.deleted_at IS NULL
WHERE niv.deleted_at IS NULL
  AND niv.activo = TRUE
  AND hm.matricula_materia_id IS NULL;
