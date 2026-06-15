-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_requeridos
-- Paralelos de la gestión académica vigente (paralelos_gestion) + asignaturas del plan habilitado.
--
-- Modelo de negocio:
-- - Grano: paralelo_gestion_id (instancia en gestión), no el paralelo maestro aislado.
-- - asignaturas_requeridas: materias del plan habilitado (gestiones_planes) para el periodo del paralelo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_requeridos;

CREATE VIEW vista_base_horarios_paralelo_requeridos AS
SELECT
    pg.id                                 AS paralelo_gestion_id,
    p.id                                  AS paralelo_id,
    p.nombre                              AS paralelo_nombre,
    pg.turno                              AS turno,
    p.carrera_id,
    car.nombre                            AS carrera_nombre,
    car.color_hex                         AS carrera_color_hex,
    p.periodo_id,
    per.numero                            AS periodo_numero,
    per.nombre                            AS periodo_nombre,
    pg.estado                             AS paralelo_gestion_estado,
    pg.aula_id                            AS paralelo_aula_id,
    COUNT(DISTINCT ap.id)                 AS asignaturas_requeridas
FROM paralelos_gestion pg
INNER JOIN gestiones_planes gp
    ON gp.id = pg.gestion_plan_id
    AND gp.deleted_at IS NULL
    AND gp.activo = TRUE
INNER JOIN gestiones g
    ON g.id = gp.gestion_id
    AND g.deleted_at IS NULL
    AND g.vigente = TRUE
INNER JOIN paralelos p
    ON p.id = pg.paralelo_id
    AND p.deleted_at IS NULL
    AND p.activo = TRUE
INNER JOIN carreras car
    ON car.id = p.carrera_id
    AND car.deleted_at IS NULL
    AND car.activo = TRUE
INNER JOIN periodos per
    ON per.id = p.periodo_id
    AND per.deleted_at IS NULL
    AND per.activo = TRUE
INNER JOIN planes_estudios pe
    ON pe.id = gp.plan_estudio_id
    AND pe.deleted_at IS NULL
    AND pe.activo = TRUE
INNER JOIN asignaturas_plan ap
    ON ap.plan_estudio_id = pe.id
    AND ap.periodo_id = p.periodo_id
    AND ap.deleted_at IS NULL
    AND ap.activo = TRUE
WHERE pg.deleted_at IS NULL
  AND pg.activo = TRUE
  AND pg.estado <> 'CERRADO'
GROUP BY
    pg.id, p.id, p.nombre, pg.turno, p.carrera_id, car.nombre, car.color_hex,
    p.periodo_id, per.numero, per.nombre, pg.estado, pg.aula_id;
