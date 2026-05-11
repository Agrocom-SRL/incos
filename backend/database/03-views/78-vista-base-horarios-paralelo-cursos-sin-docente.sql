-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_cursos_sin_docente
-- Conteo de cursos activos por paralelo sin docente asignado (asignación vigente con docente_id).
--
-- Propósito:
-- - Reutilizable en vista_horarios_paralelo_estado y otros reportes de pendientes.
-- - Un curso cuenta como “con docente” si existe al menos una asignación_docente vigente
--   activa con docente_id NOT NULL.
--
-- Tablas: cursos, asignaciones_docentes
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_cursos_sin_docente;

CREATE VIEW vista_base_horarios_paralelo_cursos_sin_docente AS
SELECT
    c.paralelo_id,
    COUNT(*) AS cursos_sin_docente
FROM cursos c
WHERE c.deleted_at IS NULL
  AND c.activo = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM asignaciones_docentes ad
      WHERE ad.curso_id = c.id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
        AND ad.docente_id IS NOT NULL
  )
GROUP BY c.paralelo_id;
