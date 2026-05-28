-- ============================================
-- VISTA BASE: vista_base_materia_asignaturas_matriz
-- Asignaturas de una materia en todos los planes (detalle ficha materia).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_materia_asignaturas_matriz;

CREATE VIEW vista_base_materia_asignaturas_matriz AS
SELECT
  ap.id AS asignatura_plan_id,
  ap.materia_id,
  ap.plan_estudio_id,
  ap.periodo_id,
  ap.horas_semanales,
  ap.creditos,
  ap.modalidad,
  ap.orden_visualizacion,
  pe.nombre_plan,
  pe.vigente AS plan_vigente,
  pe.carrera_id,
  c.codigo AS carrera_codigo,
  c.nombre AS carrera_nombre,
  c.color_hex AS carrera_color_hex,
  p.nombre AS periodo_nombre,
  p.numero AS periodo_numero,
  (
    SELECT COUNT(*)
    FROM prerrequisitos pr
    WHERE pr.asignatura_id = ap.id
      AND pr.deleted_at IS NULL
      AND pr.activo = TRUE
  ) AS cantidad_prerrequisitos
FROM asignaturas_plan ap
INNER JOIN materias m ON m.id = ap.materia_id AND m.deleted_at IS NULL
LEFT JOIN planes_estudios pe ON pe.id = ap.plan_estudio_id AND pe.deleted_at IS NULL
LEFT JOIN carreras c ON c.id = pe.carrera_id AND c.deleted_at IS NULL
LEFT JOIN periodos p ON p.id = ap.periodo_id AND p.deleted_at IS NULL
WHERE ap.deleted_at IS NULL;
