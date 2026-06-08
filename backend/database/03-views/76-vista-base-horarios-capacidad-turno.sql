-- ============================================
-- VISTA BASE: vista_base_horarios_capacidad_turno
-- Métricas de ocupación de bloques por turno de catálogo (horarios.turno).
-- Ocupación aula+franja usa paralelos_gestion.aula_id.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_capacidad_turno;

CREATE VIEW vista_base_horarios_capacidad_turno AS
SELECT
    h.turno,
    COUNT(DISTINCT h.id) AS total_bloques_disponibles,
    COUNT(DISTINCT CASE
        WHEN ah.id IS NOT NULL AND pg.aula_id IS NOT NULL
            THEN CONCAT(pg.aula_id, '-', ah.horario_id)
    END) AS bloques_ocupados,
    COUNT(DISTINCT CASE
        WHEN pg.aula_id IS NOT NULL THEN pg.aula_id
    END) AS aulas_en_uso
FROM horarios h
LEFT JOIN asignacion_horarios ah
    ON ah.horario_id = h.id
    AND ah.deleted_at IS NULL
    AND ah.activo = TRUE
LEFT JOIN asignaciones_docentes ad
    ON ad.id = ah.asignacion_docente_id
    AND ad.deleted_at IS NULL
    AND ad.activo = TRUE
    AND ad.vigente = TRUE
LEFT JOIN oferta_cursos oc
    ON oc.id = ad.oferta_curso_id
    AND oc.deleted_at IS NULL
    AND oc.activo = TRUE
LEFT JOIN paralelos_gestion pg
    ON pg.id = oc.paralelo_gestion_id
    AND pg.deleted_at IS NULL
WHERE h.deleted_at IS NULL
  AND h.activo = TRUE
  AND h.tipo_horario = 'CLASES'
  AND h.turno IS NOT NULL
GROUP BY h.turno;
