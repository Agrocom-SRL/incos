-- ============================================
-- VISTA FINAL: vista_horarios_paralelo_estado
-- Estado de cada paralelo para dashboard de gestión de horarios.
--
-- Prioridad estado: incompleto > sin_horario > conflicto > completo
--
-- incompleto:
--   - cursos del paralelo por debajo de las asignaturas requeridas del plan, o
--   - curso activo sin asignación docente vigente con docente_id
-- sin_horario:
--   - curso con al menos un bloque esperado pero sin filas en cursos_horarios, o
--   - bloque en cursos_horarios sin aula_id
-- conflicto:
--   - dos o más cursos distintos del mismo paralelo comparten el mismo horario_id, o
--   - mismo aula_id + horario_id ocupado por más de un curso (cruce global), o
--   - mismo docente con dos asignaciones vigentes que comparten franja (horario_id)
-- completo: resto
--
-- Reutiliza:
-- - vista_base_horarios_paralelo_requeridos (70)
-- - vista_base_horarios_paralelo_cursos (71)
-- - vista_base_horarios_paralelo_conflictos_aula (72)
-- - vista_base_horarios_paralelo_cursos_sin_docente (72a)
-- - vista_base_horarios_paralelo_bloques_sin_aula (72b)
-- - vista_base_horarios_paralelo_conflictos_solape_bloque (72c)
-- - vista_base_horarios_paralelo_docente_choque_horario (72d)
--
-- Métricas expuestas para UI: cursos_creados, cursos_sin_docente, bloques_sin_aula,
-- conflictos_solape_mismo_bloque, conflictos_aula, conflicto_docente_horario
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
    req.carrera_color_hex,
    req.periodo_nombre,
    req.asignaturas_requeridas,
    COALESCE(cur.cursos_creados, 0) AS cursos_creados,
    COALESCE(cur.cursos_con_horario, 0) AS cursos_con_horario,
    COALESCE(nodoc.cursos_sin_docente, 0) AS cursos_sin_docente,
    COALESCE(sinaula.bloques_sin_aula, 0) AS bloques_sin_aula,
    COALESCE(solape.conflictos_solape_mismo_bloque, 0) AS conflictos_solape_mismo_bloque,
    COALESCE(conf.conflictos_aula, 0) AS conflictos_aula,
    CASE WHEN dchoque.paralelo_id IS NOT NULL THEN 1 ELSE 0 END AS conflicto_docente_horario,
    CASE
        WHEN COALESCE(cur.cursos_creados, 0) < req.asignaturas_requeridas THEN 'incompleto'
        WHEN COALESCE(nodoc.cursos_sin_docente, 0) > 0 THEN 'incompleto'
        WHEN COALESCE(cur.cursos_con_horario, 0) < COALESCE(cur.cursos_creados, 0) THEN 'sin_horario'
        WHEN COALESCE(sinaula.bloques_sin_aula, 0) > 0 THEN 'sin_horario'
        WHEN COALESCE(solape.conflictos_solape_mismo_bloque, 0) > 0 THEN 'conflicto'
        WHEN COALESCE(conf.conflictos_aula, 0) > 0 THEN 'conflicto'
        WHEN dchoque.paralelo_id IS NOT NULL THEN 'conflicto'
        ELSE 'completo'
    END AS estado
FROM vista_base_horarios_paralelo_requeridos req
LEFT JOIN vista_base_horarios_paralelo_cursos cur
    ON cur.paralelo_id = req.paralelo_id
LEFT JOIN vista_base_horarios_paralelo_conflictos_aula conf
    ON conf.paralelo_id = req.paralelo_id
LEFT JOIN vista_base_horarios_paralelo_cursos_sin_docente nodoc
    ON nodoc.paralelo_id = req.paralelo_id
LEFT JOIN vista_base_horarios_paralelo_bloques_sin_aula sinaula
    ON sinaula.paralelo_id = req.paralelo_id
LEFT JOIN vista_base_horarios_paralelo_conflictos_solape_bloque solape
    ON solape.paralelo_id = req.paralelo_id
LEFT JOIN vista_base_horarios_paralelo_docente_choque_horario dchoque
    ON dchoque.paralelo_id = req.paralelo_id;
