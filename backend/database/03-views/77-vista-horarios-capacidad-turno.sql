-- ============================================
-- VISTA FINAL: vista_horarios_capacidad_turno
-- Capacidad/ocupación por turno para sidebar de dashboard.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_capacidad_turno;

CREATE VIEW vista_horarios_capacidad_turno AS
SELECT
    b.turno,
    b.aulas_en_uso,
    (
        SELECT COUNT(*)
        FROM aulas a2
        WHERE a2.deleted_at IS NULL
          AND a2.activo = TRUE
    ) AS total_aulas,
    ROUND(
        b.bloques_ocupados / NULLIF(b.total_bloques_disponibles, 0) * 100,
        0
    ) AS porcentaje_ocupacion
FROM vista_base_horarios_capacidad_turno b;
