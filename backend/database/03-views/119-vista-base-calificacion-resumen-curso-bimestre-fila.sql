-- ============================================
-- VISTA BASE: vista_base_calificacion_resumen_curso_bimestre_fila
-- Resumen por matrícula × bimestre para Mis cursos: cuaderno (abierto) + habilitación (cerrado).
-- Orden de despliegue: 111, 109; después de 109.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_resumen_curso_bimestre_fila;

CREATE VIEW vista_base_calificacion_resumen_curso_bimestre_fila AS
SELECT
  ad.docente_id,
  mm.asignacion_docente_id,
  gp.gestion_id,
  bm.bimestre,
  mm.id AS matricula_materia_id,
  bm.nota_teorico,
  bm.nota_practico,
  bm.nota_bimestre,
  bm.habilitacion_teorico,
  bm.habilitacion_practico,
  bm.estado AS estado_bimestre,
  COALESCE(cuad.suma_teorico, 0) AS cuaderno_teorico,
  COALESCE(cuad.suma_practico, 0) AS cuaderno_practico,
  COALESCE(cuad.tiene_nota_celda, 0) AS tiene_nota_cuaderno,
  CASE
    WHEN bm.habilitacion_teorico IS NOT NULL
      OR bm.habilitacion_practico IS NOT NULL
      OR bm.nota_bimestre IS NOT NULL
      OR bm.nota_teorico IS NOT NULL
      OR bm.nota_practico IS NOT NULL
      OR COALESCE(cuad.tiene_nota_celda, 0) = 1
    THEN 1
    ELSE 0
  END AS tiene_registro,
  COALESCE(
    bm.nota_bimestre,
    COALESCE(bm.habilitacion_teorico, bm.nota_teorico, cuad.suma_teorico, 0)
      + COALESCE(bm.habilitacion_practico, bm.nota_practico, cuad.suma_practico, 0)
  ) AS nota_efectiva
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
LEFT JOIN (
  SELECT
    cnc.bimestre_matricula_id,
    SUM(
      CASE
        WHEN cnc.componente = 'TEORICO' AND cnc.nota IS NOT NULL THEN cnc.nota
        ELSE 0
      END
    ) AS suma_teorico,
    SUM(
      CASE
        WHEN cnc.componente = 'PRACTICO' AND cnc.nota IS NOT NULL THEN cnc.nota
        ELSE 0
      END
    ) AS suma_practico,
    MAX(CASE WHEN cnc.nota IS NOT NULL THEN 1 ELSE 0 END) AS tiene_nota_celda
  FROM vista_base_cuaderno_nota_celda cnc
  GROUP BY cnc.bimestre_matricula_id
) cuad ON cuad.bimestre_matricula_id = bm.id
WHERE mm.deleted_at IS NULL
  AND mm.activo = TRUE
  AND mm.estado IN ('INSCRITO', 'CURSANDO')
  AND bm.bimestre BETWEEN 1 AND 4;
