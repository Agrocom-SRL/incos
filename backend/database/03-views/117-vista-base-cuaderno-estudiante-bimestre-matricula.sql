-- ============================================
-- VISTA BASE: vista_base_cuaderno_estudiante_bimestre_matricula
-- Resuelve bimestre_matricula_id por curso × estudiante × bimestre.
-- Orden de despliegue: 110; después de 13-evaluaciones.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cuaderno_estudiante_bimestre_matricula;

CREATE VIEW vista_base_cuaderno_estudiante_bimestre_matricula AS
SELECT
  emc.asignacion_docente_id,
  emc.estudiante_id,
  emc.matricula_materia_id,
  bm.bimestre,
  bm.id AS bimestre_matricula_id
FROM vista_base_calificacion_estudiante_matricula_curso emc
INNER JOIN bimestres_matricula bm
  ON bm.matricula_materia_id = emc.matricula_materia_id
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE;
