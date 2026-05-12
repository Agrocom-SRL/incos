-- ============================================
-- VISTA FINAL: vista_horarios_paralelo_estado
-- Agrupación única del paralelo para dashboard / KPI / tablero.
--
-- tablero_grupo (único estado expuesto):
--   sin_horarios > sin_docentes > sin_aulas > completo
--
--   sin_horarios:
--     - cursos creados por debajo de asignaturas requeridas del plan, o
--     - curso sin ninguna fila activa en cursos_horarios (ver vista_base_horarios_paralelo_cursos), o
--     - solape de franja entre cursos del mismo paralelo (vista_base_horarios_paralelo_conflictos_solape_bloque)
--
--   sin_docentes:
--     - curso activo sin asignación docente vigente (vista_base_horarios_paralelo_cursos_sin_docente), o
--     - mismo docente con dos cursos distintos en la misma horario_id en este u otros paralelos
--       (vista_base_horarios_paralelo_docente_choque_horario; alineado a detección tipo
--       vista_base_docente_asignacion_conflicto_horario / vista_docente_resumen_conflictos.conflicto_horario)
--
--   sin_aulas:
--     - bloque en cursos_horarios activo sin aula_id (vista_base_horarios_paralelo_bloques_sin_aula), o
--     - cruce global mismo aula_id + horario_id en más de un curso (vista_base_horarios_paralelo_conflictos_aula;
--       relacionado con ocupación de slot que también alimenta vista_base_docente_conflicto_aula a nivel docente)
--
--   completo: ninguna de las condiciones anteriores.
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
-- Métricas expuestas: cursos_creados, cursos_con_horario, cursos_sin_docente, bloques_sin_aula,
-- conflictos_solape_mismo_bloque, conflictos_aula, conflicto_docente_horario, tablero_grupo
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
        WHEN COALESCE(cur.cursos_creados, 0) < req.asignaturas_requeridas THEN 'sin_horarios'
        WHEN COALESCE(cur.cursos_con_horario, 0) < COALESCE(cur.cursos_creados, 0) THEN 'sin_horarios'
        WHEN COALESCE(solape.conflictos_solape_mismo_bloque, 0) > 0 THEN 'sin_horarios'
        WHEN COALESCE(nodoc.cursos_sin_docente, 0) > 0 THEN 'sin_docentes'
        WHEN dchoque.paralelo_id IS NOT NULL THEN 'sin_docentes'
        WHEN COALESCE(sinaula.bloques_sin_aula, 0) > 0 THEN 'sin_aulas'
        WHEN COALESCE(conf.conflictos_aula, 0) > 0 THEN 'sin_aulas'
        ELSE 'completo'
    END AS tablero_grupo
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
