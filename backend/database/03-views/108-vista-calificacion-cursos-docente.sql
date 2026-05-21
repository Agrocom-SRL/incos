-- ============================================
-- VISTA: vista_calificacion_cursos_docente
-- Cursos del docente en gestión vigente (Mis cursos): datos del curso, alumnos y evaluaciones del bimestre vigente.
--
-- Reutiliza:
--   - vista_base_calificacion_coordinacion_fila (102)
--   - vista_base_docente_asignaciones_curso (51)
--   - vista_calificacion_contexto_vigente (103)
--   - vista_base_calificacion_evaluaciones_curso_bimestre (107)
--
-- El repositorio filtra: WHERE docente_id = ? ORDER BY ...
--
-- Orden de despliegue: 102, 103, 107; luego 108.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_calificacion_cursos_docente;

CREATE VIEW vista_calificacion_cursos_docente AS
SELECT
  fila.docente_id,
  fila.asignacion_docente_id,
  fila.gestion_id,
  MAX(adc.materia_nombre) AS materia_nombre,
  MAX(adc.materia_sigla) AS materia_sigla,
  MAX(adc.carrera_nombre) AS carrera_nombre,
  COALESCE(NULLIF(TRIM(MAX(adc.carrera_color_hex)), ''), '#64748b') AS carrera_color_hex,
  MAX(adc.paralelo_nombre) AS paralelo_nombre,
  MAX(adc.paralelo_turno) AS paralelo_turno,
  MAX(adc.asignatura_periodo_nombre) AS asignatura_periodo_nombre,
  COALESCE(MAX(adc.horas_plan), MAX(adc.carga_horaria), 0) AS horas_semanales,
  ad.teorico_override,
  ad.practico_override,
  COUNT(DISTINCT fila.estudiante_id) AS cantidad_estudiantes,
  COALESCE(MAX(ev.cantidad_evaluaciones), 0) AS cantidad_evaluaciones_bimestre
FROM vista_base_calificacion_coordinacion_fila fila
INNER JOIN vista_base_docente_asignaciones_curso adc
  ON adc.asignacion_docente_id = fila.asignacion_docente_id
  AND adc.docente_id = fila.docente_id
INNER JOIN asignaciones_docentes ad
  ON ad.id = fila.asignacion_docente_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
CROSS JOIN vista_calificacion_contexto_vigente ctx
LEFT JOIN vista_base_calificacion_evaluaciones_curso_bimestre ev
  ON ev.asignacion_docente_id = fila.asignacion_docente_id
  AND ev.gestion_id = fila.gestion_id
  AND ev.bimestre = ctx.bimestre_vigente
GROUP BY
  fila.docente_id,
  fila.asignacion_docente_id,
  fila.gestion_id,
  ad.teorico_override,
  ad.practico_override;
