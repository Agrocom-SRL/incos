-- ============================================
-- VISTA BASE: vista_base_horarios_asignaturas_cobertura
-- Cobertura de asignaturas por carrera/periodo (oferta vs plan).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_asignaturas_cobertura;

CREATE VIEW vista_base_horarios_asignaturas_cobertura AS
SELECT
    car.id                  AS carrera_id,
    car.nombre              AS carrera_nombre,
    per.id                  AS periodo_id,
    per.numero              AS periodo_numero,
    per.nombre              AS periodo_nombre,
    ap.id                   AS asignatura_plan_id,
    m.nombre                AS materia_nombre,
    m.sigla                 AS materia_sigla,
    ap.horas_semanales,
    COUNT(DISTINCT p.id)    AS paralelos_del_periodo,
    COUNT(DISTINCT oc.id)   AS cursos_creados
FROM asignaturas_plan ap
INNER JOIN periodos per
    ON per.id = ap.periodo_id
    AND per.deleted_at IS NULL
    AND per.activo = TRUE
INNER JOIN planes_estudios pe
    ON pe.id = ap.plan_estudio_id
    AND pe.vigente = TRUE
    AND pe.deleted_at IS NULL
    AND pe.activo = TRUE
INNER JOIN carreras car
    ON car.id = pe.carrera_id
    AND car.deleted_at IS NULL
    AND car.activo = TRUE
INNER JOIN materias m
    ON m.id = ap.materia_id
    AND m.deleted_at IS NULL
    AND m.activo = TRUE
LEFT JOIN paralelos p
    ON p.carrera_id = car.id
    AND p.periodo_id = per.id
    AND p.deleted_at IS NULL
    AND p.activo = TRUE
LEFT JOIN oferta_cursos oc
    ON oc.asignatura_plan_id = ap.id
    AND oc.deleted_at IS NULL
    AND oc.activo = TRUE
WHERE ap.deleted_at IS NULL
  AND ap.activo = TRUE
GROUP BY
    car.id, car.nombre, per.id, per.numero, per.nombre,
    ap.id, m.nombre, m.sigla, ap.horas_semanales;
