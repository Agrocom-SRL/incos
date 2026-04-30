-- ============================================
-- VISTA BASE: vista_base_horarios_capacidad_turno
-- Métricas de ocupación de bloques por turno.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_horarios_capacidad_turno;

CREATE VIEW vista_base_horarios_capacidad_turno AS
SELECT
    h.turno,
    COUNT(DISTINCT h.id) AS total_bloques_disponibles,
    COUNT(DISTINCT CASE
        WHEN ch.id IS NOT NULL THEN CONCAT(ch.aula_id, '-', ch.horario_id)
    END) AS bloques_ocupados,
    COUNT(DISTINCT CASE
        WHEN ch.aula_id IS NOT NULL THEN ch.aula_id
    END) AS aulas_en_uso
FROM horarios h
LEFT JOIN cursos_horarios ch
    ON ch.horario_id = h.id
    AND ch.deleted_at IS NULL
    AND ch.activo = TRUE
    AND ch.aula_id IS NOT NULL
WHERE h.deleted_at IS NULL
  AND h.activo = TRUE
  AND h.tipo_horario = 'CLASES'
  AND h.turno IS NOT NULL
GROUP BY h.turno;
