-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_conflictos_aula
-- Conteo de conflictos de aula por paralelo
-- (mismo aula_id + horario_id ocupado por mas de un curso del sistema).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_conflictos_aula;

CREATE VIEW vista_base_horarios_paralelo_conflictos_aula AS
SELECT
    c.paralelo_id,
    COUNT(DISTINCT CONCAT(ch.aula_id, '-', ch.horario_id)) AS conflictos_aula
FROM cursos_horarios ch
INNER JOIN cursos c
    ON c.id = ch.curso_id
    AND c.deleted_at IS NULL
    AND c.activo = TRUE
INNER JOIN (
    SELECT
        ch2.aula_id,
        ch2.horario_id
    FROM cursos_horarios ch2
    WHERE ch2.deleted_at IS NULL
      AND ch2.activo = TRUE
      AND ch2.aula_id IS NOT NULL
    GROUP BY ch2.aula_id, ch2.horario_id
    HAVING COUNT(DISTINCT ch2.curso_id) > 1
) dup
    ON dup.aula_id = ch.aula_id
    AND dup.horario_id = ch.horario_id
WHERE ch.deleted_at IS NULL
  AND ch.activo = TRUE
  AND ch.aula_id IS NOT NULL
GROUP BY c.paralelo_id;
