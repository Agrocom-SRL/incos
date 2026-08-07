-- ============================================
-- VISTA BASE: vista_base_calificacion_estudiante_matricula_curso_completa
-- Estudiantes por asignación docente vigente en la oferta, en CUALQUIER
-- estado de matrícula (incluye ABANDONO/RETIRADO).
--
-- Hermana de 110 (vista_base_calificacion_estudiante_matricula_curso), que
-- SÍ filtra a INSCRITO/CURSANDO para el roster VIVO de cuaderno de notas y
-- asistencia (protege al docente de seguir cargando datos a un estudiante ya
-- retirado — CuadernoRepository, AsistenciaPlanillaViewRepository, vistas
-- 112/117 siguen usando la 110, sin cambios).
--
-- Esta vista es para pantallas de REGISTRO/REPORTE (Centralizador,
-- Consolidado, Boletín) donde un estudiante en ABANDONO/RETIRADO debe seguir
-- apareciendo con su veredicto — mismo criterio ya aplicado en 177
-- (vista_base_libro_paralelo_estudiante: "el libro físico también asienta
-- ABANDONO/RETIRADO").
--
-- Reutiliza bases ya existentes (no repite la cadena de JOINs a mano):
--   - 04 vista_base_asignaciones_inscripciones → asignación docente vigente +
--     matrícula, SIN filtro de estado.
--   - 03 vista_base_inscripciones_estudiantes → identidad del estudiante vía
--     inscripción.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_estudiante_matricula_curso_completa;

CREATE VIEW vista_base_calificacion_estudiante_matricula_curso_completa AS
SELECT
  vai.asignacion_docente_id AS asignacion_docente_id,
  vai.matricula_materia_id  AS matricula_materia_id,
  vie.estudiante_id         AS estudiante_id,
  vie.codigo_estudiante     AS codigo,
  TRIM(
    CONCAT_WS(
      ' ',
      vie.apellido_paterno,
      vie.apellido_materno,
      vie.nombres
    )
  ) AS nombre
FROM vista_base_asignaciones_inscripciones vai
INNER JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = vai.inscripcion_id
WHERE vai.asignacion_docente_id IS NOT NULL;
