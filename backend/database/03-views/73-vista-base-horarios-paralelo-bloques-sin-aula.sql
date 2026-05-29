-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_bloques_sin_aula
-- Bloques activos sin aula_id, por paralelo maestro (asignacion_horarios).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_bloques_sin_aula;

CREATE VIEW vista_base_horarios_paralelo_bloques_sin_aula AS
SELECT
    pg.paralelo_id,
    COUNT(*) AS bloques_sin_aula
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
  AND ah.aula_id IS NULL
GROUP BY pg.paralelo_id;
