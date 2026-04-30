-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_requeridos
-- Base de paralelos activos + asignaturas requeridas por plan/periodo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_requeridos;

CREATE VIEW vista_base_horarios_paralelo_requeridos AS
SELECT
    p.id                                  AS paralelo_id,
    p.nombre                              AS paralelo_nombre,
    p.turno,
    p.carrera_id,
    car.nombre                            AS carrera_nombre,
    p.periodo_id,
    per.numero                            AS periodo_numero,
    per.nombre                            AS periodo_nombre,
    COUNT(DISTINCT ap.id)                 AS asignaturas_requeridas
FROM paralelos p
INNER JOIN carreras car
    ON car.id = p.carrera_id
    AND car.deleted_at IS NULL
    AND car.activo = TRUE
INNER JOIN periodos per
    ON per.id = p.periodo_id
    AND per.deleted_at IS NULL
    AND per.activo = TRUE
INNER JOIN planes_estudios pe
    ON pe.carrera_id = p.carrera_id
    AND pe.vigente = TRUE
    AND pe.deleted_at IS NULL
    AND pe.activo = TRUE
INNER JOIN asignaturas_plan ap
    ON ap.plan_estudio_id = pe.id
    AND ap.periodo_id = p.periodo_id
    AND ap.deleted_at IS NULL
    AND ap.activo = TRUE
WHERE p.deleted_at IS NULL
  AND p.activo = TRUE
GROUP BY
    p.id, p.nombre, p.turno, p.carrera_id, car.nombre, p.periodo_id,
    per.numero, per.nombre;
