-- ============================================
-- VISTA BASE: vista_base_gestion_bimestre_cierre_pendiente
-- Filas de bimestre EN_CURSO sin nota_bimestre cerrada (validación de cierre institucional).
-- Orden de despliegue: 13-evaluaciones; después de 114.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_gestion_bimestre_cierre_pendiente;

CREATE VIEW vista_base_gestion_bimestre_cierre_pendiente AS
SELECT
  gp.gestion_id,
  bm.bimestre,
  ad.id AS asignacion_id,
  m.nombre AS materia,
  CONCAT_WS(' ', d.nombres, d.apellido_paterno, d.apellido_materno) AS docente_nombre,
  p.nombre AS paralelo,
  bm.id AS bimestre_matricula_id
FROM bimestres_matricula bm
INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
INNER JOIN cursos c ON c.id = ad.curso_id
INNER JOIN asignaturas_plan ap ON ap.id = c.asignatura_plan_id
INNER JOIN materias m ON m.id = ap.materia_id
LEFT JOIN paralelos p ON p.id = c.paralelo_id
LEFT JOIN docentes d ON d.id = ad.docente_id
WHERE mm.estado = 'CURSANDO'
  AND bm.estado = 'EN_CURSO'
  AND bm.nota_bimestre IS NULL
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE;
