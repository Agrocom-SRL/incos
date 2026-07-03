-- ============================================
-- VISTA FINAL: vista_estudiante_resumen_academico
-- Resumen académico por estudiante para el listado GET /estudiantes
-- (landing enriquecida del Historial académico — docs/plan/HISTORIAL-ACADEMICO.md).
--
-- Grano: una fila por estudiante activo.
--
-- Vista FINAL DELGADA (patrón 87/141): solo une bases y proyecta columnas:
-- - 136 vista_base_estudiante_gestion_paralelo → paralelo/periodo representativo
--   del estudiante en la GESTIÓN VIGENTE (regla de desempate ya consolidada:
--   inscripción más reciente; paralelo de mayor periodo).
-- - 142 vista_base_estudiante_historial_promedio → promedio entero del historial
--   (misma regla que resumen.promedioGeneral del transcript).
--
-- Nota: gestion_ingreso_anio NO se duplica aquí; ya lo expone
-- vista_estudiante_datos_academicos (21), segunda consulta del mismo listado.
--
-- Consumidor: StudentAcademicDataRepository.obtenerResumenAcademicoPorEstudianteIds
-- → ListStudentsUseCase / SearchStudentUseCase (campos periodoActualNumero,
-- periodoActualNombre, paraleloActual, promedioHistorial).
--
-- Dependencias (ejecutar antes):
-- - 136-vista-base-estudiante-gestion-paralelo.sql
-- - 142-vista-base-estudiante-historial-promedio.sql
--
-- Uso:
--   SELECT * FROM vista_estudiante_resumen_academico WHERE estudiante_id IN (...);
-- ============================================
USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_resumen_academico;

CREATE VIEW vista_estudiante_resumen_academico AS
SELECT
  e.id                   AS estudiante_id,
  egp.periodo_numero     AS periodo_actual_numero,
  egp.periodo_nombre     AS periodo_actual_nombre,
  egp.paralelo_nombre    AS paralelo_actual,
  php.promedio_historial AS promedio_historial
FROM estudiantes e
LEFT JOIN vista_base_estudiante_gestion_paralelo egp
  ON egp.estudiante_id = e.id
  AND egp.gestion_id = (
    SELECT MAX(g.id)
    FROM gestiones g
    WHERE g.vigente = TRUE
      AND g.activo = TRUE
      AND g.deleted_at IS NULL
  )
LEFT JOIN vista_base_estudiante_historial_promedio php
  ON php.estudiante_id = e.id
WHERE e.activo = TRUE
  AND e.deleted_at IS NULL;
