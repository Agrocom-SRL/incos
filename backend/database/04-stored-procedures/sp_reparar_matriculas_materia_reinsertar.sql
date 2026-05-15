USE instituto_incos;

DROP PROCEDURE IF EXISTS sp_reparar_matriculas_materia_reinsertar;

DELIMITER $$

CREATE PROCEDURE sp_reparar_matriculas_materia_reinsertar()
BEGIN
    DECLARE v_now DATETIME DEFAULT NOW();
    DECLARE v_eliminadas INT DEFAULT 0;
    DECLARE v_insertadas INT DEFAULT 0;

    DROP TEMPORARY TABLE IF EXISTS tmp_mm_candidatas;
    DROP TEMPORARY TABLE IF EXISTS tmp_mm_fix;

    -- Busca la asignacion activa equivalente por MISMO curso_id + MISMO gestion_plan_id.
    CREATE TEMPORARY TABLE tmp_mm_candidatas AS
    SELECT
        mm.id AS matricula_materia_id,
        COUNT(DISTINCT ad_new.id) AS total_candidatas,
        MIN(ad_new.id) AS nueva_asignacion_docente_id
    FROM matriculas_materia mm
    LEFT JOIN asignaciones_docentes ad_old
        ON ad_old.id = mm.asignacion_docente_id
    LEFT JOIN cursos c_old
        ON c_old.id = ad_old.curso_id
    LEFT JOIN asignaciones_docentes ad_new
        ON ad_new.curso_id = ad_old.curso_id
       AND ad_new.gestion_plan_id = ad_old.gestion_plan_id
       AND ad_new.id <> ad_old.id
       AND ad_new.deleted_at IS NULL
       AND ad_new.activo = 1
       AND ad_new.vigente = 1
    WHERE mm.asignacion_docente_id IS NOT NULL
      AND mm.deleted_at IS NULL
      AND mm.activo = 1
      AND (
            ad_old.id IS NULL
            OR ad_old.deleted_at IS NOT NULL
            OR ad_old.activo = 0
            OR ad_old.vigente = 0
            OR c_old.id IS NULL
            OR c_old.deleted_at IS NOT NULL
            OR c_old.activo = 0
          )
    GROUP BY mm.id;

    CREATE INDEX idx_tmp_mm_candidatas_id ON tmp_mm_candidatas (matricula_materia_id);

    -- Prepara solo las matriculas afectadas y calcula si ya existe una matricula activa equivalente.
    CREATE TEMPORARY TABLE tmp_mm_fix AS
    SELECT
        mm.id AS matricula_materia_id,
        mm.inscripcion_id,
        mm.asignacion_docente_id AS asignacion_docente_id_anterior,
        tc.nueva_asignacion_docente_id,
        tc.total_candidatas,
        COALESCE(mm.asignatura_plan_id, c_old.asignatura_plan_id) AS asignatura_plan_id_corregida,
        mm.nota_final,
        mm.estado,
        mm.historial_estados,
        mm.observaciones,
        ad_old.gestion_plan_id,
        ad_old.curso_id,
        CASE
            WHEN tc.total_candidatas = 1 AND EXISTS (
                SELECT 1
                FROM matriculas_materia mm2
                WHERE mm2.id <> mm.id
                  AND mm2.inscripcion_id = mm.inscripcion_id
                  AND mm2.asignacion_docente_id = tc.nueva_asignacion_docente_id
                  AND mm2.deleted_at IS NULL
                  AND mm2.activo = 1
            ) THEN 1
            ELSE 0
        END AS ya_existe_equivalente_activa
    FROM matriculas_materia mm
    INNER JOIN tmp_mm_candidatas tc
        ON tc.matricula_materia_id = mm.id
    LEFT JOIN asignaciones_docentes ad_old
        ON ad_old.id = mm.asignacion_docente_id
    LEFT JOIN cursos c_old
        ON c_old.id = ad_old.curso_id;

    CREATE INDEX idx_tmp_mm_fix_id ON tmp_mm_fix (matricula_materia_id);
    CREATE INDEX idx_tmp_mm_fix_resultado ON tmp_mm_fix (total_candidatas, ya_existe_equivalente_activa);

    -- Reporte antes de aplicar.
    SELECT
        CASE
            WHEN total_candidatas = 1 AND ya_existe_equivalente_activa = 0 THEN 'ELIMINAR_OLD_E_INSERTAR_NUEVA'
            WHEN total_candidatas = 1 AND ya_existe_equivalente_activa = 1 THEN 'SOLO_ELIMINAR_OLD_PORQUE_YA_EXISTE_NUEVA'
            WHEN total_candidatas = 0 THEN 'SIN_EQUIVALENTE'
            ELSE 'AMBIGUO_VARIAS_EQUIVALENTES'
        END AS resultado,
        COUNT(*) AS total
    FROM tmp_mm_fix
    GROUP BY resultado
    ORDER BY resultado;

    SELECT
        matricula_materia_id,
        asignacion_docente_id_anterior,
        nueva_asignacion_docente_id,
        gestion_plan_id,
        curso_id,
        total_candidatas,
        ya_existe_equivalente_activa
    FROM tmp_mm_fix
    ORDER BY matricula_materia_id;

    START TRANSACTION;

    -- Marca como eliminadas las matriculas viejas solo si existe una unica equivalencia segura.
    UPDATE matriculas_materia mm
    INNER JOIN tmp_mm_fix f
        ON f.matricula_materia_id = mm.id
    SET
        mm.activo = 0,
        mm.deleted_at = v_now,
        mm.updated_at = v_now,
        mm.observaciones = NULLIF(TRIM(CONCAT_WS('\n',
            NULLIF(TRIM(mm.observaciones), ''),
            CONCAT(
                'Registro anterior marcado como eliminado. asignacion_docente_id anterior=',
                f.asignacion_docente_id_anterior,
                ', nueva=',
                f.nueva_asignacion_docente_id,
                ', curso_id=',
                COALESCE(f.curso_id, 'NULL'),
                '.'
            )
        )), '')
    WHERE f.total_candidatas = 1;

    SET v_eliminadas = ROW_COUNT();

    -- Inserta una nueva matricula corregida solo si todavia no existe activa equivalente.
    INSERT INTO matriculas_materia (
        inscripcion_id,
        asignacion_docente_id,
        asignatura_plan_id,
        nota_final,
        estado,
        historial_estados,
        observaciones,
        activo,
        created_at,
        updated_at,
        deleted_at
    )
    SELECT
        f.inscripcion_id,
        f.nueva_asignacion_docente_id,
        f.asignatura_plan_id_corregida,
        f.nota_final,
        f.estado,
        f.historial_estados,
        NULLIF(TRIM(CONCAT_WS('\n',
            NULLIF(TRIM(f.observaciones), ''),
            CONCAT(
                'Nuevo registro insertado desde matricula_materia_id=',
                f.matricula_materia_id,
                '. asignacion_docente_id corregido de ',
                f.asignacion_docente_id_anterior,
                ' a ',
                f.nueva_asignacion_docente_id,
                '.'
            )
        )), '') AS observaciones,
        1 AS activo,
        v_now AS created_at,
        v_now AS updated_at,
        NULL AS deleted_at
    FROM tmp_mm_fix f
    WHERE f.total_candidatas = 1
        AND f.ya_existe_equivalente_activa = 0;

    SET v_insertadas = ROW_COUNT();

    COMMIT;
    
    SELECT
        v_eliminadas AS matriculas_viejas_marcadas_eliminadas,
        v_insertadas AS matriculas_nuevas_insertadas;
END$$

DELIMITER ;

-- USO:
-- CALL sp_reparar_matriculas_materia_reinsertar(0, NULL); -- validar
-- CALL sp_reparar_matriculas_materia_reinsertar(1, 1);    -- aplicar
