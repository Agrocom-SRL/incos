-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_aula
-- Cruces aula efectiva + horario por paralelo_gestion (gestión vigente).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_conflictos_aula;

CREATE VIEW vista_base_horarios_paralelo_conflictos_aula AS
SELECT
    pg.id AS paralelo_gestion_id,
    COUNT(DISTINCT CONCAT(COALESCE(ah.aula_id, pg.aula_id), '-', ah.horario_id)) AS conflictos_aula
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
INNER JOIN (
    SELECT
        COALESCE(ah2.aula_id, pg2.aula_id) AS aula_efectiva_id,
        ah2.horario_id
    FROM asignacion_horarios ah2
    INNER JOIN asignaciones_docentes ad2
        ON ad2.id = ah2.asignacion_docente_id
        AND ad2.deleted_at IS NULL
        AND ad2.activo = TRUE
        AND ad2.vigente = TRUE
    INNER JOIN oferta_cursos oc2
        ON oc2.id = ad2.oferta_curso_id
        AND oc2.deleted_at IS NULL
        AND oc2.activo = TRUE
    INNER JOIN paralelos_gestion pg2
        ON pg2.id = oc2.paralelo_gestion_id
        AND pg2.deleted_at IS NULL
    INNER JOIN gestiones_planes gp2
        ON gp2.id = pg2.gestion_plan_id
        AND gp2.deleted_at IS NULL
    INNER JOIN gestiones g2
        ON g2.id = gp2.gestion_id
        AND g2.deleted_at IS NULL
        AND g2.vigente = TRUE
    WHERE ah2.deleted_at IS NULL
      AND ah2.activo = TRUE
      AND COALESCE(ah2.aula_id, pg2.aula_id) IS NOT NULL
    GROUP BY COALESCE(ah2.aula_id, pg2.aula_id), ah2.horario_id
    HAVING COUNT(DISTINCT ad2.oferta_curso_id) > 1
) dup
    ON dup.aula_efectiva_id = COALESCE(ah.aula_id, pg.aula_id)
    AND dup.horario_id = ah.horario_id
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE
  AND COALESCE(ah.aula_id, pg.aula_id) IS NOT NULL
GROUP BY pg.id;
