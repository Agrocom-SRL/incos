-- ============================================
-- VISTA: vista_calificacion_coordinacion_docentes
-- Docentes con al menos un curso con estudiantes matriculados (INSCRITO/CURSANDO)
-- en la gestión académica vigente.
--
-- Cadena de datos:
--   matriculas_materia → inscripciones (gestión) → asignaciones_docentes → docente
-- Reutiliza vista_base_asignaciones_inscripciones (join matrícula ↔ asignación).
--
-- Uso:
--   SELECT * FROM vista_calificacion_coordinacion_docentes ORDER BY cantidad_cursos DESC;
--   El repositorio aplica LIKE por docente_nombre / docente_especialidad y LIMIT
--   (mismo patrón que vista_estudiante_busqueda_registro_aporte + StudentRepository).
--
-- Contexto gestión/bimestre: vista_calificacion_contexto_vigente (103).
--
-- Orden de despliegue: 04, 50; luego este script; 103 para contexto.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_calificacion_coordinacion_docentes;

CREATE VIEW vista_calificacion_coordinacion_docentes AS
SELECT
  agg.docente_id,
  agg.docente_nombre,
  agg.docente_especialidad,
  agg.gestion_id,
  agg.gestion_anio,
  agg.gestion_nombre,
  agg.cantidad_cursos
FROM (
  SELECT
    ad.docente_id,
    TRIM(
      CONCAT_WS(
        ' ',
        f.nombres,
        f.apellido_paterno,
        f.apellido_materno
      )
    ) AS docente_nombre,
    f.especialidad AS docente_especialidad,
    g.id AS gestion_id,
    g.anio AS gestion_anio,
    g.nombre AS gestion_nombre,
    COUNT(DISTINCT ba.asignacion_docente_id) AS cantidad_cursos
  FROM vista_base_asignaciones_inscripciones ba
  INNER JOIN inscripciones ins
    ON ins.id = ba.inscripcion_id
    AND ins.activo = TRUE
    AND ins.deleted_at IS NULL
  INNER JOIN asignaciones_docentes ad
    ON ad.id = ba.asignacion_docente_id
    AND ad.deleted_at IS NULL
    AND ad.activo = TRUE
  INNER JOIN gestiones_planes gp
    ON gp.id = ad.gestion_plan_id
    AND gp.deleted_at IS NULL
    AND gp.activo = TRUE
  INNER JOIN gestiones g
    ON g.id = gp.gestion_id
    AND g.id = ins.gestion_id
    AND g.vigente = TRUE
    AND g.activo = TRUE
    AND g.deleted_at IS NULL
  INNER JOIN vista_base_docente_ficha f
    ON f.docente_id = ad.docente_id
    AND f.activo = TRUE
    AND f.estado_laboral = 'ACTIVO'
  WHERE ba.matricula_estado IN ('INSCRITO', 'CURSANDO')
  GROUP BY
    ad.docente_id,
    f.nombres,
    f.apellido_paterno,
    f.apellido_materno,
    f.especialidad,
    g.id,
    g.anio,
    g.nombre
) agg;
