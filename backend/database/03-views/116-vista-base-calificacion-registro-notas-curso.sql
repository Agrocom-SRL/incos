-- ============================================
-- VISTA BASE: vista_base_calificacion_registro_notas_curso
-- Estudiantes matriculados × bimestres con componentes (gestión vigente).
-- Orden de despliegue: 110, 112; después de 103.
--
-- 2026-08-07 (Fase C, ABANDONO en Consolidado): `emc` pasa de la vista 110
-- (restringida a INSCRITO/CURSANDO) a la 188 (mismo grano, sin filtro de
-- estado) — cierra el gap de la Fase A: `GetRegistroNotasCursoUseCase` ya
-- sabía calcular el veredicto ABANDONO por `estado_materia`, pero la fila
-- nunca llegaba a existir aquí mientras `emc` viniera de la 110.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_registro_notas_curso;

CREATE VIEW vista_base_calificacion_registro_notas_curso AS
SELECT
  emc.asignacion_docente_id,
  emc.estudiante_id,
  emc.codigo AS codigo_estudiante,
  est.ci AS cedula,
  emc.nombre AS nombre_completo,
  emc.matricula_materia_id,
  mm.nota_final,
  mm.estado AS estado_materia,
  rb.bimestre,
  rb.nota_teorico,
  rb.nota_practico,
  rb.nota_bimestre,
  rb.estado_bimestre
FROM vista_base_calificacion_estudiante_matricula_curso_completa emc
INNER JOIN matriculas_materia mm
  ON mm.id = emc.matricula_materia_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
INNER JOIN asignaciones_docentes ad
  ON ad.id = emc.asignacion_docente_id
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
INNER JOIN estudiantes est
  ON est.id = emc.estudiante_id
  AND est.deleted_at IS NULL
  AND est.activo = TRUE
LEFT JOIN vista_base_cuaderno_resumen_estudiante_bimestre rb
  ON rb.asignacion_docente_id = emc.asignacion_docente_id
  AND rb.estudiante_id = emc.estudiante_id;
