-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_cursos
-- Ofertas creadas y ofertas con al menos un bloque horario por paralelo maestro.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_cursos;

CREATE VIEW vista_base_horarios_paralelo_cursos AS
SELECT
    pg.paralelo_id,
    COUNT(DISTINCT oc.id) AS cursos_creados,
    COUNT(DISTINCT CASE WHEN bloques.total_horarios > 0 THEN oc.id END) AS cursos_con_horario
FROM oferta_cursos oc
INNER JOIN paralelos_gestion pg
    ON pg.id = oc.paralelo_gestion_id
    AND pg.deleted_at IS NULL
    AND pg.activo = TRUE
LEFT JOIN (
    SELECT
        ad.oferta_curso_id,
        COUNT(*) AS total_horarios
    FROM asignacion_horarios ah
    INNER JOIN asignaciones_docentes ad
        ON ad.id = ah.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
    WHERE ah.deleted_at IS NULL
      AND ah.activo = TRUE
    GROUP BY ad.oferta_curso_id
) bloques
    ON bloques.oferta_curso_id = oc.id
WHERE oc.deleted_at IS NULL
  AND oc.activo = TRUE
GROUP BY pg.paralelo_id;
