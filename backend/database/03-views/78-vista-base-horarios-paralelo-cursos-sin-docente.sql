-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_cursos_sin_docente
-- Ofertas activas por paralelo_gestion sin docente vigente (gestión vigente).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_cursos_sin_docente;

CREATE VIEW vista_base_horarios_paralelo_cursos_sin_docente AS
SELECT
    pg.id AS paralelo_gestion_id,
    COUNT(*) AS cursos_sin_docente
FROM oferta_cursos oc
INNER JOIN paralelos_gestion pg
    ON pg.id = oc.paralelo_gestion_id
    AND pg.deleted_at IS NULL
    AND pg.activo = TRUE
    AND pg.estado <> 'CERRADO'
INNER JOIN gestiones_planes gp
    ON gp.id = pg.gestion_plan_id
    AND gp.deleted_at IS NULL
INNER JOIN gestiones g
    ON g.id = gp.gestion_id
    AND g.deleted_at IS NULL
    AND g.vigente = TRUE
WHERE oc.deleted_at IS NULL
  AND oc.activo = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM asignaciones_docentes ad
      WHERE ad.oferta_curso_id = oc.id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
        AND ad.docente_id IS NOT NULL
  )
GROUP BY pg.id;
