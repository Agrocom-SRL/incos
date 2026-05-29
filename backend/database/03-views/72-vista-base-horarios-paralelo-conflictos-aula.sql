-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_aula
-- Conflictos aula+horario por paralelo (asignacion_horarios).
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
        ah2.aula_id,
        ah2.horario_id
    FROM asignacion_horarios ah2
    INNER JOIN asignaciones_docentes ad2 ON ad2.id = ah2.asignacion_docente_id
    WHERE ah2.deleted_at IS NULL
      AND ah2.activo = TRUE
      AND ah2.aula_id IS NOT NULL
    GROUP BY ah2.aula_id, ah2.horario_id
    HAVING COUNT(DISTINCT ad2.oferta_curso_id) > 1
) dup
    ON dup.aula_id = ah.aula_id
    AND dup.horario_id = ah.horario_id
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE
  AND ah.aula_id IS NOT NULL
GROUP BY pg.paralelo_id;
