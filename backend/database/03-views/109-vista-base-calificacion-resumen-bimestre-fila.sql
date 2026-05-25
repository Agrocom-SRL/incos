-- ============================================
-- VISTA BASE: vista_base_calificacion_resumen_bimestre_fila
-- Una fila por matrícula activa × bimestre operativo (gestión vigente).
-- Expone nota efectiva y estado para agregación en el repositorio (umbral de aprobación parametrizable).
--
-- Orden de despliegue: 12-inscripciones, 13-evaluaciones; después de 103.
-- Consumida por: CalificacionRepository (GROUP BY en aplicación).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_resumen_bimestre_fila;

CREATE VIEW vista_base_calificacion_resumen_bimestre_fila AS
SELECT
  ad.docente_id,
  mm.asignacion_docente_id,
  gp.gestion_id,
  bm.bimestre,
  mm.id AS matricula_materia_id,
  COALESCE(
    bm.nota_bimestre,
    COALESCE(bm.habilitacion_teorico, bm.nota_teorico, 0)
      + COALESCE(bm.habilitacion_practico, bm.nota_practico, 0)
  ) AS nota_efectiva,
  bm.estado AS estado_bimestre
FROM matriculas_materia mm
INNER JOIN bimestres_matricula bm
  ON bm.matricula_materia_id = mm.id
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE
INNER JOIN asignaciones_docentes ad
  ON ad.id = mm.asignacion_docente_id
  AND ad.deleted_at IS NULL
  AND ad.activo = TRUE
INNER JOIN gestiones_planes gp
  ON gp.id = ad.gestion_plan_id
  AND gp.deleted_at IS NULL
INNER JOIN gestiones g
  ON g.id = gp.gestion_id
  AND g.vigente = TRUE
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
WHERE mm.deleted_at IS NULL
  AND mm.activo = TRUE
  AND mm.estado IN ('INSCRITO', 'CURSANDO')
  AND bm.bimestre BETWEEN 1 AND 4;
