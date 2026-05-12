-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_solape_bloque
-- Franjas (horario_id) dentro del mismo paralelo ocupadas por más de un curso distinto.
--
-- Propósito:
-- - Detectar solapes “imposibles” para un mismo grupo (dos materias a la misma hora).
-- - Reutilizable en vista_horarios_paralelo_estado.
--
-- Tablas: cursos_horarios, cursos
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_conflictos_solape_bloque;

CREATE VIEW vista_base_horarios_paralelo_conflictos_solape_bloque AS
SELECT
    x.paralelo_id,
    COUNT(*) AS conflictos_solape_mismo_bloque
FROM (
    SELECT
        ch.horario_id,
        c.paralelo_id
    FROM cursos_horarios ch
    INNER JOIN cursos c
        ON c.id = ch.curso_id
        AND c.deleted_at IS NULL
        AND c.activo = TRUE
    WHERE ch.deleted_at IS NULL
      AND ch.activo = TRUE
      AND ch.horario_id IS NOT NULL
    GROUP BY ch.horario_id, c.paralelo_id
    HAVING COUNT(DISTINCT c.id) > 1
) x
GROUP BY x.paralelo_id;
