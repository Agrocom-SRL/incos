-- ============================================
-- VISTA BASE: vista_base_historial_asignatura_plan_detalle
-- Detalle de la asignatura del plan para el historial académico (transcript).
--
-- Grano: una fila por asignaturas_plan. Consolida la cadena de JOINs
-- plan → materia → periodo → prerrequisito, de modo que las vistas de nota
-- (138 CURSADO / 140 PREVIO) solo aporten identidad + nota/estado y la vista
-- final (141) ensamble sin reescribir estos JOINs.
--
-- No se reutiliza la 120 (vista_base_materia_asignaturas_matriz) porque ésa es
-- la ficha por materia y NO expone la sigla/nombre de la materia ni la SIGLA del
-- prerrequisito, solo su cantidad; el transcript necesita ambas.
--
-- Fuentes:
--   asignaturas_plan → materias (sigla/nombre), → periodos (numero/nombre).
--   prerrequisito_sigla por subconsulta: prerrequisitos → asignaturas_plan →
--   materias.sigla (primer prerrequisito por orden de sigla).
--
-- Uso:
--   SELECT * FROM vista_base_historial_asignatura_plan_detalle
--   WHERE asignatura_plan_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_historial_asignatura_plan_detalle;

CREATE VIEW vista_base_historial_asignatura_plan_detalle AS
SELECT
  ap.id                                    AS asignatura_plan_id,
  ap.horas_semanales                       AS carga_horaria,
  ap.orden_visualizacion                   AS asignatura_orden,
  per.numero                               AS periodo_numero,
  per.nombre                               AS periodo_nombre,
  mat.sigla                                AS asignatura_sigla,
  mat.nombre                               AS asignatura_nombre,
  (SELECT prm.sigla
     FROM prerrequisitos pr
     JOIN asignaturas_plan apr ON apr.id = pr.prerrequisito_id AND apr.deleted_at IS NULL
     JOIN materias prm ON prm.id = apr.materia_id AND prm.deleted_at IS NULL
    WHERE pr.asignatura_id = ap.id AND pr.deleted_at IS NULL AND pr.activo = 1
    ORDER BY prm.sigla
    LIMIT 1)                               AS prerrequisito_sigla
FROM asignaturas_plan ap
INNER JOIN materias mat
  ON mat.id = ap.materia_id AND mat.deleted_at IS NULL
LEFT JOIN periodos per
  ON per.id = ap.periodo_id AND per.deleted_at IS NULL
WHERE ap.deleted_at IS NULL;
