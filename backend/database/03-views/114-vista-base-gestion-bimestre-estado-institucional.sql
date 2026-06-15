-- ============================================
-- VISTA BASE: vista_base_gestion_bimestre_estado_institucional
-- Estado agregado por bimestre operativo en una gestión (PENDIENTE / EN_CURSO / CERRADO).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_gestion_bimestre_estado_institucional;

CREATE VIEW vista_base_gestion_bimestre_estado_institucional AS
SELECT
  gp.gestion_id,
  bm.bimestre,
  CASE
    WHEN COUNT(*) = SUM(CASE WHEN bm.estado = 'CERRADO' THEN 1 ELSE 0 END) THEN 'CERRADO'
    WHEN SUM(CASE WHEN bm.estado = 'EN_CURSO' THEN 1 ELSE 0 END) > 0 THEN 'EN_CURSO'
    ELSE 'PENDIENTE'
  END AS estado_institucional
FROM bimestres_matricula bm
INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
INNER JOIN asignaciones_docentes ad
  ON ad.oferta_curso_id = mm.oferta_curso_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
  AND ad.vigente = TRUE
INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
WHERE gp.gestion_id IS NOT NULL
  AND mm.estado IN ('INSCRITO', 'CURSANDO')
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE
GROUP BY gp.gestion_id, bm.bimestre;
