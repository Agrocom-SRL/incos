-- ============================================
-- VISTA: vista_estudiante_inscripcion_actual
-- Datos de inscripci?n actual del estudiante por gesti?n: una fila por materia
--
-- Prop?sito: Une inscripciones (por gesti?n) con las piezas base 04, 02, 01, 18-19 para obtener:
-- - Inscripci?n: gesti?n_id, tipo_inscripcion, fecha_inscripcion
-- - Materias inscritas: una fila por materia con informaci?n completa
-- - Paralelo, periodo, carrera: campos complementarios por materia (desde curso ? paralelo)
--
-- Devuelve una fila por materia inscrita. Cada fila incluye:
-- - Datos de inscripci?n (compartidos)
-- - Datos de la materia (sigla, nombre, tipo, etc.)
-- - Paralelo, periodo, carrera (complementarios, desde el curso de la materia)
--
-- Uso:
-- SELECT * FROM vista_estudiante_inscripcion_actual WHERE estudiante_id = ? AND gestion_id = ?;
-- SELECT * FROM vista_estudiante_inscripcion_actual WHERE codigo_estudiante = ? AND gestion_id = ?;
-- SELECT * FROM vista_estudiante_inscripcion_actual WHERE inscripcion_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_inscripcion_actual;

CREATE VIEW vista_estudiante_inscripcion_actual AS
SELECT
  -- Estudiante basico (para filtros, desde vista_base_inscripciones_estudiantes)
  vie.estudiante_id,
  vie.codigo_estudiante,
  vie.ci,
  vie.expedicion,
  -- Inscripcion (por gestion, desde vista_base_inscripciones_estudiantes)
  vie.inscripcion_id,
  vie.estudiante_datos_academicos_id,
  vie.gestion_id,
  vie.tipo_inscripcion,
  vie.fecha_inscripcion,
  i.observaciones AS inscripcion_observaciones,
  -- Gestion
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  g.vigente AS gestion_vigente,
  -- Materia inscrita (una fila por materia)
  vai.inscripcion_materia_id,
  vai.asignacion_docente_id,
  vai.curso_id,
  vai.docente_id,
  vai.materia_estado,
  im.observaciones AS materia_observaciones,
  -- Curso
  vca.curso_codigo,
  vca.paralelo_id,
  -- Paralelo, periodo, carrera (complementarios desde el curso)
  vpi.paralelo_nombre,
  vpi.paralelo_turno,
  vpi.paralelo_descripcion,
  vpi.carrera_id,
  vpi.carrera_nombre,
  vpi.carrera_codigo,
  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre,
  -- Materia (datos completos)
  vam.materia_id,
  vam.periodo_id AS materia_periodo_id,
  vam.horas_semanales,
  vam.creditos,
  vam.materia_modalidad,
  vam.materia_orden,
  vam.materia_sigla,
  vam.materia_nombre,
  vam.materia_objetivos,
  vam.materia_clasificacion,
  vam.materia_tipo
FROM vista_base_inscripciones_estudiantes vie
LEFT JOIN gestiones g ON g.id = vie.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
LEFT JOIN inscripciones i ON i.id = vie.inscripcion_id
  AND i.activo = TRUE
  AND i.deleted_at IS NULL
INNER JOIN vista_base_asignaciones_inscripciones vai ON vai.inscripcion_id = vie.inscripcion_id
INNER JOIN inscripciones_materias im ON im.id = vai.inscripcion_materia_id
  AND im.activo = TRUE
  AND im.deleted_at IS NULL
INNER JOIN vista_base_cursos_asignaturas vca ON vca.curso_id = vai.curso_id
INNER JOIN vista_base_cursos_paralelos vcp ON vcp.curso_id = vai.curso_id
INNER JOIN vista_base_paralelos_info vpi ON vpi.paralelo_id = vcp.paralelo_id
INNER JOIN vista_base_asignaturas_materias vam ON vam.materia_id = vca.materia_id
  AND vam.periodo_id = vca.periodo_id;
