-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_solape_bloque
-- Franjas ocupadas por más de una oferta en el mismo paralelo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_conflictos_solape_bloque;

CREATE VIEW vista_base_horarios_paralelo_conflictos_solape_bloque AS
SELECT
    x.paralelo_id,
    COUNT(*) AS conflictos_solape_mismo_bloque
FROM (
    SELECT
        ah.horario_id,
        pg.paralelo_id
    FROM asignacion_horarios ah
    INNER JOIN asignaciones_docentes ad
        ON ad.id = ah.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
    INNER JOIN oferta_cursos oc
        ON oc.id = ad.oferta_curso_id
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
    INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
    WHERE ah.deleted_at IS NULL
      AND ah.activo = TRUE
      AND ah.horario_id IS NOT NULL
    GROUP BY ah.horario_id, pg.paralelo_id
    HAVING COUNT(DISTINCT oc.id) > 1
) x
GROUP BY x.paralelo_id;
