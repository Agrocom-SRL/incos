-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_aula
-- Conflictos aula efectiva + horario por paralelo maestro (KPI tablero).
--
-- Aula efectiva = COALESCE(asignacion_horarios.aula_id, paralelos_gestion.aula_id).
-- Detalle por paralelo_gestion: vista_base_paralelo_gestion_conflicto_aula_bloque (125).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_conflictos_aula;

CREATE VIEW vista_base_horarios_paralelo_conflictos_aula AS
SELECT
    pg.paralelo_id,
    COUNT(DISTINCT CONCAT(ah.aula_id, '-', ah.horario_id)) AS conflictos_aula
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
INNER JOIN (
    SELECT
        COALESCE(ah2.aula_id, pg2.aula_id) AS aula_efectiva_id,
        ah2.horario_id
    FROM asignacion_horarios ah2
    INNER JOIN asignaciones_docentes ad2
        ON ad2.id = ah2.asignacion_docente_id
        AND ad2.deleted_at IS NULL
        AND ad2.activo = TRUE
    INNER JOIN oferta_cursos oc2
        ON oc2.id = ad2.oferta_curso_id
        AND oc2.deleted_at IS NULL
        AND oc2.activo = TRUE
    INNER JOIN paralelos_gestion pg2
        ON pg2.id = oc2.paralelo_gestion_id
        AND pg2.deleted_at IS NULL
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
GROUP BY pg.paralelo_id;
