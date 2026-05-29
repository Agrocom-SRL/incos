-- ============================================
-- VISTA BASE: vista_base_horarios_capacidad_turno
-- Métricas de ocupación de bloques por turno (asignacion_horarios).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_capacidad_turno;

CREATE VIEW vista_base_horarios_capacidad_turno AS
SELECT
    h.turno,
    COUNT(DISTINCT h.id) AS total_bloques_disponibles,
    COUNT(DISTINCT CASE
        WHEN ah.id IS NOT NULL THEN CONCAT(ah.aula_id, '-', ah.horario_id)
    END) AS bloques_ocupados,
    COUNT(DISTINCT CASE
        WHEN ah.aula_id IS NOT NULL THEN ah.aula_id
    END) AS aulas_en_uso
FROM horarios h
LEFT JOIN asignacion_horarios ah
    ON ah.horario_id = h.id
    AND ah.deleted_at IS NULL
    AND ah.activo = TRUE
    AND ah.aula_id IS NOT NULL
WHERE h.deleted_at IS NULL
  AND h.activo = TRUE
  AND h.tipo_horario = 'CLASES'
  AND h.turno IS NOT NULL
GROUP BY h.turno;
