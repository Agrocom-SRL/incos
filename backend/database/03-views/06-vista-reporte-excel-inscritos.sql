-- ============================================
-- VISTA: vista_reporte_excel_inscritos
-- Vista para el reporte Excel de estadísticas de inscritos
--
-- Objetivo:
-- - Una fila por (paralelo × gestión activa), aunque no haya inscripciones (totales en 0).
-- - Inscripción / efectivos / abandonos / reprobados por género, agregados por paralelo,
--   periodo (año de carrera) y carrera — alineado con la matriz del Excel (A/B/C/D por paralelo).
--
-- Reutiliza:
-- - vista_base_paralelos_info, vista_base_cursos_paralelos,
--   vista_base_asignaciones_inscripciones, vista_base_inscripciones_estudiantes
--
-- Uso:
-- SELECT * FROM vista_reporte_excel_inscritos WHERE gestion_id = 2
-- ORDER BY carrera_nombre, periodo_numero, paralelo_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_reporte_excel_inscritos;

CREATE VIEW vista_reporte_excel_inscritos AS
SELECT
  vpi.paralelo_id,
  vpi.paralelo_nombre,
  vpi.paralelo_turno,
  vpi.carrera_id,
  vpi.carrera_nombre,
  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre,
  g.id AS gestion_id,
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  g.vigente AS gestion_vigente,

  COUNT(DISTINCT CASE WHEN vie.genero = 'FEMENINO' THEN vie.estudiante_id END) AS total_mujeres,
  COUNT(DISTINCT CASE WHEN vie.genero = 'MASCULINO' THEN vie.estudiante_id END) AS total_hombres,

  COUNT(DISTINCT CASE
    WHEN vai.materia_estado NOT IN ('ABANDONO', 'RETIRADO')
      AND vie.genero = 'FEMENINO'
    THEN vie.estudiante_id
  END) AS total_mujeres_efectivos,
  COUNT(DISTINCT CASE
    WHEN vai.materia_estado NOT IN ('ABANDONO', 'RETIRADO')
      AND vie.genero = 'MASCULINO'
    THEN vie.estudiante_id
  END) AS total_hombres_efectivos,

  COUNT(DISTINCT CASE
    WHEN vai.materia_estado = 'ABANDONO'
      AND vie.genero = 'FEMENINO'
    THEN vie.estudiante_id
  END) AS total_mujeres_abandono,
  COUNT(DISTINCT CASE
    WHEN vai.materia_estado = 'ABANDONO'
      AND vie.genero = 'MASCULINO'
    THEN vie.estudiante_id
  END) AS total_hombres_abandono,

  COUNT(DISTINCT CASE
    WHEN vai.materia_estado = 'REPROBADO'
      AND vie.genero = 'FEMENINO'
    THEN vie.estudiante_id
  END) AS total_mujeres_reprobado,
  COUNT(DISTINCT CASE
    WHEN vai.materia_estado = 'REPROBADO'
      AND vie.genero = 'MASCULINO'
    THEN vie.estudiante_id
  END) AS total_hombres_reprobado

FROM vista_base_paralelos_info vpi
INNER JOIN gestiones g
  ON g.activo = TRUE
  AND g.deleted_at IS NULL
LEFT JOIN vista_base_cursos_paralelos vcp ON vcp.paralelo_id = vpi.paralelo_id
LEFT JOIN vista_base_asignaciones_inscripciones vai ON vai.curso_id = vcp.curso_id
LEFT JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = vai.inscripcion_id
  AND vie.gestion_id = g.id
GROUP BY
  vpi.paralelo_id,
  vpi.paralelo_nombre,
  vpi.paralelo_turno,
  vpi.carrera_id,
  vpi.carrera_nombre,
  vpi.periodo_id,
  vpi.periodo_numero,
  vpi.periodo_nombre,
  g.id,
  g.nombre,
  g.anio,
  g.vigente;
