-- ============================================
-- VISTA FINAL: vista_docente_curso_estudiantes
-- Roster de estudiantes por curso del docente (Mis estudiantes, portal docente).
--
-- Propósito:
-- - Una fila por estudiante matriculado × curso asignado al docente.
-- - Consumida por GET /api/v1/docentes/mis-estudiantes (DashboardRepository.
--   findEstudiantesDeDocente): el docente ve el roster de SUS cursos vigentes.
--
-- Vista final delgada (patrón 87): solo une 2 vistas base + matriculas_materia:
-- - vista_base_docente_asignaciones_curso (51): curso + docente + contexto académico
-- - matriculas_materia: matrícula del estudiante a la oferta (estado, nota_final)
-- - vista_base_inscripciones_estudiantes (03): identidad del estudiante
--
-- Cadena de datos: paralelos_gestion → oferta_cursos → asignaciones_docentes;
-- el roster llega por matriculas_materia.oferta_curso_id = oferta del curso.
--
-- Uso:
-- SELECT * FROM vista_docente_curso_estudiantes
-- WHERE docente_id = ? AND gestion_id = ? AND vigente = TRUE
-- ORDER BY carrera_nombre, materia_sigla, apellido_paterno;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_docente_curso_estudiantes;

CREATE VIEW vista_docente_curso_estudiantes AS
SELECT
  adc.docente_id,
  adc.asignacion_docente_id,
  adc.oferta_curso_id,
  adc.vigente,
  adc.gestion_id,
  adc.gestion_nombre,
  adc.gestion_anio,
  adc.materia_sigla,
  adc.materia_nombre,
  adc.carrera_id,
  adc.carrera_codigo,
  adc.carrera_nombre,
  adc.carrera_color_hex,
  adc.paralelo_nombre,
  adc.paralelo_turno,
  adc.asignatura_periodo_nombre,
  mm.id AS matricula_materia_id,
  mm.estado AS estado_matricula,
  mm.nota_final,
  vie.inscripcion_id,
  vie.tipo_inscripcion,
  vie.estudiante_id,
  vie.codigo_estudiante,
  vie.ci,
  vie.expedicion,
  vie.apellido_paterno,
  vie.apellido_materno,
  vie.nombres,
  vie.genero
FROM vista_base_docente_asignaciones_curso adc
INNER JOIN matriculas_materia mm
  ON mm.oferta_curso_id = adc.oferta_curso_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
INNER JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = mm.inscripcion_id;
