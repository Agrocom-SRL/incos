-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_aula
-- Cruces de aula efectiva + horario entre paralelos_gestion distintos (gestión vigente).
--
-- Aula efectiva = COALESCE(asignacion_horarios.aula_id, paralelos_gestion.aula_id).
-- El solape de franjas dentro del mismo paralelo lo cubre vista_base_horarios_paralelo_conflictos_solape_bloque (86).
-- El choque intra-paralelo (misma pg + franja + aula) lo cubre vista_base_paralelo_gestion_conflicto_aula_bloque (125).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_conflictos_aula;

CREATE VIEW vista_base_horarios_paralelo_conflictos_aula AS
SELECT
    base.paralelo_gestion_id,
    COUNT(DISTINCT CONCAT(base.aula_efectiva_id, '-', base.horario_id)) AS conflictos_aula
FROM (
    SELECT
        pg.id AS paralelo_gestion_id,
        ah.horario_id,
        COALESCE(ah.aula_id, pg.aula_id) AS aula_efectiva_id,
        ad.id AS asignacion_docente_id
    FROM asignacion_horarios ah
    INNER JOIN asignaciones_docentes ad
        ON ad.id = ah.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
    INNER JOIN oferta_cursos oc
        ON oc.id = ad.oferta_curso_id
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
    INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
        AND pg.estado <> 'CERRADO'
    INNER JOIN gestiones_planes gp
        ON gp.id = pg.gestion_plan_id
        AND gp.deleted_at IS NULL
    INNER JOIN gestiones g
        ON g.id = gp.gestion_id
        AND g.deleted_at IS NULL
        AND g.vigente = TRUE
    WHERE ah.deleted_at IS NULL
      AND ah.activo = TRUE
      AND ah.horario_id IS NOT NULL
      AND COALESCE(ah.aula_id, pg.aula_id) IS NOT NULL
) base
INNER JOIN (
    SELECT
        pg.id AS paralelo_gestion_id,
        ah.horario_id,
        COALESCE(ah.aula_id, pg.aula_id) AS aula_efectiva_id,
        ad.id AS asignacion_docente_id
    FROM asignacion_horarios ah
    INNER JOIN asignaciones_docentes ad
        ON ad.id = ah.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
    INNER JOIN oferta_cursos oc
        ON oc.id = ad.oferta_curso_id
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
    INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
        AND pg.estado <> 'CERRADO'
    INNER JOIN gestiones_planes gp
        ON gp.id = pg.gestion_plan_id
        AND gp.deleted_at IS NULL
    INNER JOIN gestiones g
        ON g.id = gp.gestion_id
        AND g.deleted_at IS NULL
        AND g.vigente = TRUE
    WHERE ah.deleted_at IS NULL
      AND ah.activo = TRUE
      AND ah.horario_id IS NOT NULL
      AND COALESCE(ah.aula_id, pg.aula_id) IS NOT NULL
) otro
    ON otro.aula_efectiva_id = base.aula_efectiva_id
    AND otro.horario_id = base.horario_id
    AND otro.paralelo_gestion_id <> base.paralelo_gestion_id
    AND otro.asignacion_docente_id <> base.asignacion_docente_id
GROUP BY base.paralelo_gestion_id;
