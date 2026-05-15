-- ============================================
-- VISTA: vista_estadisticas_paralelos_por_gestion
-- Estadísticas de estudiantes inscritos por paralelo filtradas por gestión
--
-- Propósito:
-- Obtener estadísticas de inscripciones por paralelo para una gestión específica:
-- - Total de estudiantes inscritos
-- - Total por género: hombres y mujeres
--
-- Esta vista REUTILIZA las vistas base:
-- - vista_base_paralelos_info (paralelos + periodos + carreras)
-- - vista_base_cursos_paralelos (cursos + paralelos)
-- - vista_base_asignaciones_inscripciones (asignaciones_docentes + matriculas_materia)
-- - vista_base_inscripciones_estudiantes (inscripciones + estudiantes)
--
-- Nota de diseño:
-- Como vista estadística de inscritos, cuenta estudiantes con matrícula activa/no eliminada.
-- No elimina ABANDONO o RETIRADO en la vista base; si se requiere "efectivos",
-- usar la vista vista_reporte_excel_inscritos.
--
-- Uso:
-- SELECT * FROM vista_estadisticas_paralelos_por_gestion WHERE gestion_id = 2;
-- SELECT * FROM vista_estadisticas_paralelos_por_gestion WHERE gestion_id = 2 AND paralelo_id IN (11,12,13);
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estadisticas_paralelos_por_gestion;

CREATE VIEW vista_estadisticas_paralelos_por_gestion AS
SELECT
  vpi.paralelo_id,
  vpi.paralelo_nombre,
  vpi.paralelo_turno,

  vpi.carrera_id,
  vpi.carrera_nombre,

  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre,

  vie.gestion_id,
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  g.vigente AS gestion_vigente,

  COUNT(DISTINCT vie.estudiante_id) AS total_inscritos,
  COUNT(DISTINCT CASE
    WHEN vie.genero = 'MASCULINO' THEN vie.estudiante_id
  END) AS total_hombres,
  COUNT(DISTINCT CASE
    WHEN vie.genero = 'FEMENINO' THEN vie.estudiante_id
  END) AS total_mujeres
FROM vista_base_paralelos_info vpi
LEFT JOIN vista_base_cursos_paralelos vcp
  ON vcp.paralelo_id = vpi.paralelo_id
LEFT JOIN vista_base_asignaciones_inscripciones vai
  ON vai.curso_id = vcp.curso_id
LEFT JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = vai.inscripcion_id
LEFT JOIN gestiones g
  ON g.id = vie.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
GROUP BY
  vpi.paralelo_id,
  vpi.paralelo_nombre,
  vpi.paralelo_turno,

  vpi.carrera_id,
  vpi.carrera_nombre,

  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre,

  vie.gestion_id,
  g.nombre,
  g.anio,
  g.vigente;
