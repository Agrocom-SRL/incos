-- ============================================
-- VISTA BASE: vista_base_asistencia_planilla_celda
-- Celda de la planilla de asistencia: roster del curso × sesiones tomadas, con la
-- marca registrada (asistencias, modelo SPARSE) y la licencia APROBADA cruzada.
--
-- 1 fila = 1 estudiante matriculado × 1 sesión de su curso.
--   - Reutiliza el roster de Calificaciones (vista 110) para el cruce roster⋈sesión.
--   - matriculas_materia aporta inscripcion_id para cruzar licencias (sin FK).
--   - asistencias aporta la marca persistida (solo AUSENTE/TARDANZA existen;
--     ausencia de fila = PRESENTE implícito).
--   - licencias APROBADAS vigentes (rango cubre la fecha) marcan la celda como L.
--
-- El estado/marca final (P/R/F/L) y la neutralidad se derivan en el mapper de
-- aplicación; aquí se exponen los insumos crudos + estudianteNombre ordenado.
--
-- Consumidor: AsistenciaPlanillaViewRepository → GetPlanillaAsistenciaSemanalUseCase.
-- Orden de despliegue: después de 110 (roster) y 17 (sesiones_clase, asistencias).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_asistencia_planilla_celda;

CREATE VIEW vista_base_asistencia_planilla_celda AS
SELECT
  sc.id                                AS sesion_clase_id,
  sc.asignacion_docente_id,
  sc.periodo_academico_id,
  sc.fecha                             AS fecha_clase,
  sc.es_especial,
  sc.motivo,
  sc.estado                            AS sesion_estado,
  r.matricula_materia_id,
  r.estudiante_id,
  r.codigo                             AS estudiante_codigo,
  r.nombre                             AS estudiante_nombre,
  asi.estado                           AS estado,
  CASE WHEN lic.id IS NOT NULL THEN 1 ELSE 0 END AS tiene_licencia
FROM sesiones_clase sc
INNER JOIN vista_base_calificacion_estudiante_matricula_curso r
  ON r.asignacion_docente_id = sc.asignacion_docente_id
INNER JOIN matriculas_materia mm
  ON mm.id = r.matricula_materia_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
LEFT JOIN asistencias asi
  ON asi.sesion_clase_id = sc.id
  AND asi.matricula_materia_id = r.matricula_materia_id
  AND asi.deleted_at IS NULL
  AND asi.activo = TRUE
LEFT JOIN licencias lic
  ON lic.inscripcion_id = mm.inscripcion_id
  AND lic.estado = 'APROBADA'
  AND lic.activo = TRUE
  AND lic.deleted_at IS NULL
  AND sc.fecha BETWEEN lic.fecha_inicio AND lic.fecha_fin
WHERE sc.activo = TRUE
  AND sc.deleted_at IS NULL;
