-- ============================================
-- VISTA: vista_calificacion_coordinacion_docentes
-- Agregación por docente para coordinación de calificaciones (gestión vigente).
--
-- Reutiliza:
--   - vista_base_calificacion_coordinacion_fila (102): detalle por matrícula + docente
--   - vista_base_docente_ficha (50): nombre y especialidad del docente
--
-- Métricas:
--   cantidad_cursos, cantidad_materias, cantidad_estudiantes
--   carreras_detalle — nombre:::color_hex separados por |||
--
-- El repositorio aplica LIKE y LIMIT sobre esta vista.
--
-- Orden de despliegue: 103 → 102 → 104 (y 105–109 para otros endpoints de CalificacionRepository).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_calificacion_coordinacion_docentes;

CREATE VIEW vista_calificacion_coordinacion_docentes AS
SELECT
  f.docente_id,
  TRIM(
    CONCAT_WS(
      ' ',
      f.nombres,
      f.apellido_paterno,
      f.apellido_materno
    )
  ) AS docente_nombre,
  f.especialidad AS docente_especialidad,
  fila.gestion_id,
  fila.gestion_anio,
  fila.gestion_nombre,
  COUNT(DISTINCT fila.asignacion_docente_id) AS cantidad_cursos,
  COUNT(DISTINCT fila.materia_id) AS cantidad_materias,
  COUNT(DISTINCT fila.estudiante_id) AS cantidad_estudiantes,
  GROUP_CONCAT(
    DISTINCT CONCAT(fila.carrera_nombre, ':::', fila.carrera_color_hex)
    ORDER BY fila.carrera_nombre
    SEPARATOR '|||'
  ) AS carreras_detalle
FROM vista_base_calificacion_coordinacion_fila fila
INNER JOIN vista_base_docente_ficha f
  ON f.docente_id = fila.docente_id
  AND f.activo = TRUE
  AND f.estado_laboral = 'ACTIVO'
GROUP BY
  f.docente_id,
  f.nombres,
  f.apellido_paterno,
  f.apellido_materno,
  f.especialidad,
  fila.gestion_id,
  fila.gestion_anio,
  fila.gestion_nombre;
