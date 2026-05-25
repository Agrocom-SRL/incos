-- ============================================
-- VISTA BASE: vista_base_gestion_metricas_bimestre
-- Métricas agregadas por gestión × bimestre (plan de evaluaciones, notas pendientes).
-- Orden de despliegue: 107, 115; después de 114.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_gestion_metricas_bimestre;

CREATE VIEW vista_base_gestion_metricas_bimestre AS
SELECT
  gp.gestion_id,
  bm.bimestre,
  COUNT(DISTINCT ad.id) AS cursos_total,
  COUNT(DISTINCT CASE
    WHEN ev.cantidad_evaluaciones > 0 THEN ad.id
  END) AS cursos_plan_completo,
  COUNT(DISTINCT CASE
    WHEN bm.nota_bimestre IS NULL AND bm.estado = 'EN_CURSO' THEN ad.id
  END) AS cursos_notas_faltantes
FROM bimestres_matricula bm
INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
LEFT JOIN vista_base_calificacion_evaluaciones_curso_bimestre ev
  ON ev.asignacion_docente_id = ad.id
  AND ev.gestion_id = gp.gestion_id
  AND ev.bimestre = bm.bimestre
WHERE mm.estado IN ('INSCRITO', 'CURSANDO')
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
  AND bm.deleted_at IS NULL
GROUP BY gp.gestion_id, bm.bimestre;
