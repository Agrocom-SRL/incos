-- ============================================
-- VISTA FINAL: vista_horarios_paralelo_estado
-- Estado de cada paralelo para dashboard de gestión de horarios.
-- Prioridad estado: incompleto > sin_horario > conflicto > completo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_paralelo_estado;

CREATE VIEW vista_horarios_paralelo_estado AS
SELECT
    req.paralelo_id,
    req.paralelo_nombre,
    req.turno,
    req.carrera_id,
    req.carrera_nombre,
    req.periodo_id,
    req.periodo_numero,
    req.periodo_nombre,
    req.asignaturas_requeridas,
    COALESCE(cur.cursos_creados, 0)      AS cursos_creados,
    COALESCE(cur.cursos_con_horario, 0)  AS cursos_con_horario,
    COALESCE(conf.conflictos_aula, 0)    AS conflictos_aula,
    CASE
        WHEN COALESCE(cur.cursos_creados, 0) < req.asignaturas_requeridas THEN 'incompleto'
        WHEN COALESCE(cur.cursos_con_horario, 0) < COALESCE(cur.cursos_creados, 0) THEN 'sin_horario'
        WHEN COALESCE(conf.conflictos_aula, 0) > 0 THEN 'conflicto'
        ELSE 'completo'
    END AS estado
FROM vista_base_horarios_paralelo_requeridos req
LEFT JOIN vista_base_horarios_paralelo_cursos cur
    ON cur.paralelo_id = req.paralelo_id
LEFT JOIN vista_base_horarios_paralelo_conflictos_aula conf
    ON conf.paralelo_id = req.paralelo_id;
