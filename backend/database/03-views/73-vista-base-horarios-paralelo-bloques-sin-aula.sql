-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_bloques_sin_aula
-- Paralelos_gestion con bloques activos pero sin aula base asignada.
--
-- Aula: solo paralelos_gestion.aula_id (Oferta académica).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_bloques_sin_aula;

CREATE VIEW vista_base_horarios_paralelo_bloques_sin_aula AS
SELECT
    pg.id AS paralelo_gestion_id,
    COUNT(*) AS bloques_sin_aula
FROM asignacion_horarios ah
INNER JOIN asignaciones_docentes ad
    ON ad.id = ah.asignacion_docente_id
    AND ad.deleted_at IS NULL
    AND ad.activo = TRUE
    AND ad.vigente = TRUE
INNER JOIN oferta_cursos oc
    ON oc.id = ad.oferta_curso_id
    AND oc.deleted_at IS NULL
    AND oc.activo = TRUE
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
WHERE ah.deleted_at IS NULL
  AND ah.activo = TRUE
  AND pg.aula_id IS NULL
GROUP BY pg.id;
