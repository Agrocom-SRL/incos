-- ============================================
-- VISTA BASE: vista_base_cuaderno_nota_celda
-- Celda de nota (evaluaciones_notas) con contexto de curso, bimestre y estudiante.
--
-- Reutilizada por: listarNotasCuaderno, listarTodasNotasBimestreCuaderno, cálculo bimestre.
-- Orden de despliegue: 13-evaluaciones; después de 110.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cuaderno_nota_celda;

CREATE VIEW vista_base_cuaderno_nota_celda AS
SELECT
  ev.asignacion_docente_id,
  bm.bimestre,
  bm.id AS bimestre_matricula_id,
  est.id AS estudiante_id,
  en.evaluacion_id,
  en.nota,
  ev.componente,
  ev.puntos AS puntos_maximos
FROM evaluaciones_notas en
INNER JOIN evaluaciones ev
  ON ev.id = en.evaluacion_id
  AND ev.deleted_at IS NULL
  AND ev.activo = TRUE
INNER JOIN bimestres_matricula bm
  ON bm.id = en.bimestre_matricula_id
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE
INNER JOIN matriculas_materia mm
  ON mm.id = bm.matricula_materia_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
INNER JOIN inscripciones ins
  ON ins.id = mm.inscripcion_id
  AND ins.deleted_at IS NULL
  AND ins.activo = TRUE
INNER JOIN estudiantes_datos_academicos eda
  ON eda.id = ins.datos_academicos_id
  AND eda.deleted_at IS NULL
  AND eda.activo = TRUE
INNER JOIN estudiantes est
  ON est.id = eda.estudiante_id
  AND est.deleted_at IS NULL
  AND est.activo = TRUE
WHERE en.deleted_at IS NULL
  AND en.activo = TRUE;
