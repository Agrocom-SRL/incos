-- ============================================
-- VISTA BASE: vista_base_carrera_asignaturas_matriz
-- Matriz plan/periodo/materia por carrera (detalle ficha carrera).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_carrera_asignaturas_matriz;

CREATE VIEW vista_base_carrera_asignaturas_matriz AS
SELECT
  ap.id AS asignatura_plan_id,
  pe.carrera_id,
  ap.plan_estudio_id,
  pe.nombre_plan,
  pe.vigente AS plan_vigente,
  ap.periodo_id,
  p.nombre AS periodo_nombre,
  p.numero AS periodo_numero,
  p.orden_visualizacion AS periodo_orden,
  ap.materia_id,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  m.tipo AS materia_tipo,
  m.clasificacion AS materia_clasificacion,
  ap.horas_semanales,
  ap.creditos,
  ap.modalidad,
  (
    SELECT COUNT(*)
    FROM prerrequisitos pr
    WHERE pr.asignatura_id = ap.id
      AND pr.deleted_at IS NULL
      AND pr.activo = TRUE
  ) AS cantidad_prerrequisitos
FROM asignaturas_plan ap
INNER JOIN materias m ON m.id = ap.materia_id AND m.deleted_at IS NULL
INNER JOIN planes_estudios pe ON pe.id = ap.plan_estudio_id AND pe.deleted_at IS NULL
LEFT JOIN periodos p ON p.id = ap.periodo_id AND p.deleted_at IS NULL
WHERE ap.deleted_at IS NULL
  AND pe.carrera_id IS NOT NULL;
