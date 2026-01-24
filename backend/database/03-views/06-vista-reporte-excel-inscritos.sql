-- ============================================
-- VISTA: vista_reporte_excel_inscritos
-- Vista completa para generar reporte Excel de estadísticas de estudiantes
-- 
-- Propósito: Obtener todos los datos necesarios para el reporte Excel:
-- - Inscripciones totales por género
-- - Efectivos (sin abandonos ni retirados)
-- - Abandonos por género
-- - Reprobados por género
-- 
-- Esta vista REUTILIZA las vistas base:
-- - vista_base_paralelos_info (paralelos + periodos + carreras)
-- - vista_base_cursos_paralelos (cursos + paralelos)
-- - vista_base_asignaciones_inscripciones (asignaciones + inscripciones_materias)
-- - vista_base_inscripciones_estudiantes (inscripciones + estudiantes)
-- 
-- Uso:
-- SELECT * FROM vista_reporte_excel_inscritos WHERE gestion_id = 2
-- ORDER BY carrera_nombre, periodo_numero, paralelo_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_reporte_excel_inscritos;

CREATE VIEW vista_reporte_excel_inscritos AS
SELECT 
  -- IDENTIFICACIÓN
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
  
  -- INSCRIPCIÓN (total de estudiantes inscritos)
  COUNT(DISTINCT CASE WHEN vie.genero = 'FEMENINO' THEN vie.estudiante_id END) AS total_mujeres,
  COUNT(DISTINCT CASE WHEN vie.genero = 'MASCULINO' THEN vie.estudiante_id END) AS total_hombres,
  
  -- EFECTIVOS (estudiantes que NO abandonaron ni se retiraron)
  -- Son los que tienen estado INSCRITO o CURSANDO en inscripciones_materias
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
  
  -- ABANDONOS (estudiantes que abandonaron)
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
  
  -- REPROBADOS (estudiantes que reprobaron)
  -- NOTA: Si existe tabla calificaciones, se puede usar:
  --   COUNT(DISTINCT CASE WHEN c.estado = 'REPROBADO' AND vie.genero = 'FEMENINO' THEN vie.estudiante_id END)
  -- Por ahora, si no existe calificaciones, se puede usar estado en inscripciones_materias
  -- o simplemente retornar 0 y calcular desde otra fuente
  -- 
  -- VERSIÓN SIMPLE: Si inscripciones_materias tiene estado REPROBADO
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
  
  -- VERSIÓN CON CALIFICACIONES (descomentar si existe tabla calificaciones):
  -- COALESCE(
  --   (SELECT COUNT(DISTINCT vie2.estudiante_id)
  --    FROM calificaciones c
  --    INNER JOIN inscripciones_materias im ON im.id = c.inscripcion_materia_id
  --    INNER JOIN vista_base_asignaciones_inscripciones vai2 ON vai2.inscripcion_materia_id = im.id
  --    INNER JOIN vista_base_cursos_paralelos vcp2 ON vcp2.curso_id = vai2.curso_id
  --    INNER JOIN vista_base_inscripciones_estudiantes vie2 ON vie2.inscripcion_id = im.inscripcion_id
  --    WHERE c.estado = 'REPROBADO'
  --      AND vie2.genero = 'FEMENINO'
  --      AND vie2.gestion_id = vie.gestion_id
  --      AND vcp2.paralelo_id = vpi.paralelo_id
  --      AND c.activo = TRUE
  --   ), 0
  -- ) AS total_mujeres_reprobado,
  -- COALESCE(
  --   (SELECT COUNT(DISTINCT vie2.estudiante_id)
  --    FROM calificaciones c
  --    INNER JOIN inscripciones_materias im ON im.id = c.inscripcion_materia_id
  --    INNER JOIN vista_base_asignaciones_inscripciones vai2 ON vai2.inscripcion_materia_id = im.id
  --    INNER JOIN vista_base_cursos_paralelos vcp2 ON vcp2.curso_id = vai2.curso_id
  --    INNER JOIN vista_base_inscripciones_estudiantes vie2 ON vie2.inscripcion_id = im.inscripcion_id
  --    WHERE c.estado = 'REPROBADO'
  --      AND vie2.genero = 'MASCULINO'
  --      AND vie2.gestion_id = vie.gestion_id
  --      AND vcp2.paralelo_id = vpi.paralelo_id
  --      AND c.activo = TRUE
  --   ), 0
  -- ) AS total_hombres_reprobado

FROM vista_base_paralelos_info vpi
LEFT JOIN vista_base_cursos_paralelos vcp ON vcp.paralelo_id = vpi.paralelo_id
LEFT JOIN vista_base_asignaciones_inscripciones vai ON vai.curso_id = vcp.curso_id
LEFT JOIN vista_base_inscripciones_estudiantes vie ON vie.inscripcion_id = vai.inscripcion_id
LEFT JOIN gestiones g ON g.id = vie.gestion_id
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

-- ============================================
-- NOTAS:
-- 
-- 1. INSCRIPCIÓN: Cuenta todos los estudiantes inscritos (sin filtrar por estado)
-- 2. EFECTIVOS: Estudiantes con estado INSCRITO o CURSANDO (no ABANDONO ni RETIRADO)
-- 3. ABANDONOS: Estudiantes con estado ABANDONO en inscripciones_materias
-- 4. REPROBADOS: Estudiantes con estado REPROBADO en calificaciones
--    (Si la tabla calificaciones no existe aún, estos valores serán 0)
-- 
-- 5. APROBADOS: Se calculan automáticamente en Excel como:
--    Efectivos - Abandonos - Reprobados
-- ============================================
