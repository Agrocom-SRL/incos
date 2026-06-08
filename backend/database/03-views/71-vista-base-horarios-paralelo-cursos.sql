-- ============================================
-- VISTA BASE: vista_base_horarios_paralelo_cursos
-- Ofertas creadas y ofertas con cobertura horaria completa por paralelo_gestion (gestión vigente).
--
-- cursos_con_horario: oferta con docente vigente y bloques >= horas del plan
-- (asignaturas_plan.horas_semanales; respaldo ad.carga_horaria).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_paralelo_cursos;

CREATE VIEW vista_base_horarios_paralelo_cursos AS
SELECT
    pg.id AS paralelo_gestion_id,
    COUNT(DISTINCT oc.id) AS cursos_creados,
    COUNT(DISTINCT CASE WHEN cov.cobertura_completa = 1 THEN oc.id END) AS cursos_con_horario,
    COUNT(DISTINCT CASE
        WHEN cov.asignacion_docente_id IS NOT NULL AND cov.cobertura_completa = 0 THEN oc.id
    END) AS ofertas_cobertura_incompleta
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
LEFT JOIN (
    SELECT
        ad.oferta_curso_id,
        MAX(ad.id) AS asignacion_docente_id,
        CASE
            WHEN MAX(ad.docente_id) IS NULL THEN 0
            WHEN COUNT(ah.id) = COALESCE(MAX(ap.horas_semanales), MAX(ad.carga_horaria), 0)
                AND COALESCE(MAX(ap.horas_semanales), MAX(ad.carga_horaria), 0) > 0
            THEN 1
            ELSE 0
        END AS cobertura_completa
    FROM asignaciones_docentes ad
    INNER JOIN oferta_cursos oc2
        ON oc2.id = ad.oferta_curso_id
        AND oc2.deleted_at IS NULL
        AND oc2.activo = TRUE
    INNER JOIN asignaturas_plan ap
        ON ap.id = oc2.asignatura_plan_id
        AND ap.deleted_at IS NULL
    LEFT JOIN asignacion_horarios ah
        ON ah.asignacion_docente_id = ad.id
        AND ah.deleted_at IS NULL
        AND ah.activo = TRUE
    WHERE ad.deleted_at IS NULL
      AND ad.activo = TRUE
      AND ad.vigente = TRUE
    GROUP BY ad.oferta_curso_id
) cov
    ON cov.oferta_curso_id = oc.id
WHERE oc.deleted_at IS NULL
  AND oc.activo = TRUE
GROUP BY pg.id;
