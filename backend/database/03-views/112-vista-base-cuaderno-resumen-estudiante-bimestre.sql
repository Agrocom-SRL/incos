-- ============================================
-- VISTA BASE: vista_base_cuaderno_resumen_estudiante_bimestre
-- Estudiante matriculado × cada bimestre operativo (una fila por matrícula × bimestre).
--
-- Para un solo bimestre con LEFT JOIN opcional, usar vista_base_calificacion_estudiante_matricula_curso.
-- Orden de despliegue: 13-evaluaciones; después de 110.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cuaderno_resumen_estudiante_bimestre;

CREATE VIEW vista_base_cuaderno_resumen_estudiante_bimestre AS
SELECT
  emc.asignacion_docente_id,
  emc.matricula_materia_id,
  emc.estudiante_id,
  emc.codigo,
  emc.nombre,
  bm.bimestre,
  bm.id AS bimestre_matricula_id,
  bm.nota_teorico,
  bm.nota_practico,
  bm.nota_bimestre,
  bm.estado AS estado_bimestre
FROM vista_base_calificacion_estudiante_matricula_curso emc
INNER JOIN bimestres_matricula bm
  ON bm.matricula_materia_id = emc.matricula_materia_id
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE
  AND bm.bimestre BETWEEN 1 AND 4;
