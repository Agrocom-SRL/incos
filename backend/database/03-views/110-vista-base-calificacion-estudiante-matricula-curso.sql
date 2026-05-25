-- ============================================
-- VISTA BASE: vista_base_calificacion_estudiante_matricula_curso
-- Estudiantes con matrícula activa por asignación docente (curso).
--
-- Reutilizada por: cuaderno (resumen bimestre), registro de notas.
-- Orden de despliegue: 12-inscripciones; después de 103.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_estudiante_matricula_curso;

CREATE VIEW vista_base_calificacion_estudiante_matricula_curso AS
SELECT
  mm.asignacion_docente_id,
  mm.id AS matricula_materia_id,
  est.id AS estudiante_id,
  est.codigo_estudiante AS codigo,
  TRIM(
    CONCAT_WS(
      ' ',
      est.nombres,
      est.apellido_paterno,
      est.apellido_materno
    )
  ) AS nombre
FROM matriculas_materia mm
INNER JOIN inscripciones ins
  ON ins.id = mm.inscripcion_id
  AND ins.deleted_at IS NULL
  AND ins.activo = TRUE
INNER JOIN estudiantes_datos_academicos eda
  ON eda.id = ins.datos_academicos_id
  AND eda.deleted_at IS NULL
  AND eda.activo = TRUE
INNER JOIN estudiantes est
  ON est.id = eda.estudiante_id
  AND est.deleted_at IS NULL
  AND est.activo = TRUE
WHERE mm.estado IN ('INSCRITO', 'CURSANDO')
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE;
