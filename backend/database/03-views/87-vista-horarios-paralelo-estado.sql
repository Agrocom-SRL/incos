-- ============================================
-- VISTA FINAL: vista_horarios_paralelo_estado
-- Dashboard KPI / tablero — grano paralelo_gestion en gestión vigente.
--
-- tablero_grupo (prioridad única por paralelo):
--   sin_aulas > sin_docentes > sin_horarios > completo
--
--   sin_aulas: paralelo sin aula base o bloques sin aula efectiva
--   sin_docentes: oferta sin docente vigente o choque de docente
--   sin_horarios: oferta incompleta, cobertura, solape de franja o cruce de aula entre paralelos
--   completo: sin pendientes de aula, docencia ni plan semanal
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_horarios_paralelo_estado;

CREATE VIEW vista_horarios_paralelo_estado AS
SELECT
    req.paralelo_gestion_id,
    req.paralelo_id,
    req.paralelo_nombre,
    req.turno,
    req.carrera_id,
    req.carrera_nombre,
    req.carrera_color_hex,
    req.periodo_nombre,
    req.paralelo_gestion_estado,
    req.paralelo_aula_id,
    req.asignaturas_requeridas,
    COALESCE(cur.cursos_creados, 0) AS cursos_creados,
    COALESCE(cur.cursos_con_horario, 0) AS cursos_con_horario,
    COALESCE(cur.ofertas_cobertura_incompleta, 0) AS ofertas_cobertura_incompleta,
    COALESCE(nodoc.cursos_sin_docente, 0) AS cursos_sin_docente,
    COALESCE(sinaula.bloques_sin_aula, 0) AS bloques_sin_aula,
    COALESCE(solape.conflictos_solape_mismo_bloque, 0) AS conflictos_solape_mismo_bloque,
    COALESCE(conf.conflictos_aula, 0) AS conflictos_aula,
    CASE WHEN dchoque.paralelo_gestion_id IS NOT NULL THEN 1 ELSE 0 END AS conflicto_docente_horario,
    CASE
        WHEN req.paralelo_aula_id IS NULL THEN 'sin_aulas'
        WHEN COALESCE(sinaula.bloques_sin_aula, 0) > 0 THEN 'sin_aulas'
        WHEN COALESCE(nodoc.cursos_sin_docente, 0) > 0 THEN 'sin_docentes'
        WHEN dchoque.paralelo_gestion_id IS NOT NULL THEN 'sin_docentes'
        WHEN COALESCE(cur.cursos_creados, 0) < req.asignaturas_requeridas THEN 'sin_horarios'
        WHEN COALESCE(cur.ofertas_cobertura_incompleta, 0) > 0 THEN 'sin_horarios'
        WHEN COALESCE(cur.cursos_con_horario, 0) < COALESCE(cur.cursos_creados, 0) THEN 'sin_horarios'
        WHEN COALESCE(solape.conflictos_solape_mismo_bloque, 0) > 0 THEN 'sin_horarios'
        WHEN COALESCE(conf.conflictos_aula, 0) > 0 THEN 'sin_horarios'
        ELSE 'completo'
    END AS tablero_grupo
FROM vista_base_horarios_paralelo_requeridos req
LEFT JOIN vista_base_horarios_paralelo_cursos cur
    ON cur.paralelo_gestion_id = req.paralelo_gestion_id
LEFT JOIN vista_base_horarios_paralelo_conflictos_aula conf
    ON conf.paralelo_gestion_id = req.paralelo_gestion_id
LEFT JOIN vista_base_horarios_paralelo_cursos_sin_docente nodoc
    ON nodoc.paralelo_gestion_id = req.paralelo_gestion_id
LEFT JOIN vista_base_horarios_paralelo_bloques_sin_aula sinaula
    ON sinaula.paralelo_gestion_id = req.paralelo_gestion_id
LEFT JOIN vista_base_horarios_paralelo_conflictos_solape_bloque solape
    ON solape.paralelo_gestion_id = req.paralelo_gestion_id
LEFT JOIN vista_base_horarios_paralelo_docente_choque_horario dchoque
    ON dchoque.paralelo_gestion_id = req.paralelo_gestion_id;
