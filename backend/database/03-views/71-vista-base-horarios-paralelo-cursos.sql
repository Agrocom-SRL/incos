-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_cursos
-- Cursos creados y cursos con al menos un horario por paralelo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_cursos;

CREATE VIEW vista_base_horarios_paralelo_cursos AS
SELECT
    c.paralelo_id,
    COUNT(DISTINCT c.id) AS cursos_creados,
    COUNT(DISTINCT CASE WHEN ch_count.total_horarios > 0 THEN c.id END) AS cursos_con_horario
FROM cursos c
LEFT JOIN (
    SELECT
        curso_id,
        COUNT(*) AS total_horarios
    FROM cursos_horarios
    WHERE deleted_at IS NULL
      AND activo = TRUE
    GROUP BY curso_id
) ch_count
    ON ch_count.curso_id = c.id
WHERE c.deleted_at IS NULL
  AND c.activo = TRUE
GROUP BY c.paralelo_id;
