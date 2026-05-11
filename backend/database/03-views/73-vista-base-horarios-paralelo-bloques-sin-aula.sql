-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_bloques_sin_aula
-- Conteo de filas en cursos_horarios (activas) con aula_id NULL, por paralelo.
--
-- Propósito:
-- - Reutilizable en vista_horarios_paralelo_estado y paneles de aulas pendientes.
--
-- Tablas: cursos_horarios, cursos
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_bloques_sin_aula;

CREATE VIEW vista_base_horarios_paralelo_bloques_sin_aula AS
SELECT
    c.paralelo_id,
    COUNT(*) AS bloques_sin_aula
FROM cursos_horarios ch
INNER JOIN cursos c
    ON c.id = ch.curso_id
    AND c.deleted_at IS NULL
    AND c.activo = TRUE
WHERE ch.deleted_at IS NULL
  AND ch.activo = TRUE
  AND ch.aula_id IS NULL
GROUP BY c.paralelo_id;
