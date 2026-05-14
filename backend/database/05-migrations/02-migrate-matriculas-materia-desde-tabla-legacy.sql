-- ============================================
-- MIGRACIÓN DE DATOS: matriculas_materia
-- Origen: tabla legacy existente inscripciones_materias
-- Destino: tabla nueva matriculas_materia
--
-- Uso: ejecutar cuando AMBAS tablas existen en la misma BD:
--   - inscripciones_materias  (legacy con datos reales)
--   - matriculas_materia      (nuevo enfoque / schema limpio)
--
-- No usa INSERT masivo fijo. Migra con INSERT ... SELECT.
-- Conserva IDs, auditoría, soft delete y relaciones principales.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 2) LIMPIAR DESTINO
-- ============================================
-- Como el destino es el nuevo enfoque, lo recargamos desde la tabla legacy.
-- Si ya tienes datos nuevos manuales que NO quieres perder, NO ejecutes esta línea.

DELETE FROM matriculas_materia;

-- ============================================
-- 2) MIGRACIÓN PRINCIPAL
-- ============================================
-- Mapeo:
--   legacy.id                              -> nuevo.id
--   legacy.inscripcion_id                  -> nuevo.inscripcion_id
--   legacy.asignacion_docente_id           -> nuevo.asignacion_docente_id
--   cursos.asignatura_plan_id              -> nuevo.asignatura_plan_id
--   COALESCE(nota_definitiva, nota_final)  -> nuevo.nota_final
--   legacy.estado                          -> nuevo.estado
--   legacy.created_at                      -> nuevo.historial_estados
--   observaciones + observaciones_docente  -> nuevo.observaciones
--   auditoría y soft delete                -> se conservan
-- ============================================

INSERT INTO matriculas_materia (
    id,
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
    deleted_at,
    created_by,
    updated_by,
    deleted_by
)
SELECT
    im.id,
    im.inscripcion_id,
    im.asignacion_docente_id,
    c.asignatura_plan_id,

    -- Se toma nota_definitiva si existe; si no, nota_final.
    -- En el nuevo modelo sigue siendo solo un caché consolidado.
    COALESCE(im.nota_definitiva, im.nota_final) AS nota_final,

    COALESCE(im.estado, 'INSCRITO') AS estado,

    -- Historial simple del estado normal inicial/actual.
    -- Ejemplo: {"INSCRITO": "2026-03-09"}
    CASE
        WHEN im.estado IS NOT NULL AND im.created_at IS NOT NULL THEN
            JSON_OBJECT(im.estado, DATE(im.created_at))
        WHEN im.estado IS NOT NULL THEN
            JSON_OBJECT(im.estado, NULL)
        ELSE
            JSON_OBJECT('INSCRITO', CASE WHEN im.created_at IS NOT NULL THEN DATE(im.created_at) ELSE NULL END)
    END AS historial_estados,

    -- Se consolidan las dos observaciones del legacy en una sola propiedad.
    NULLIF(
        TRIM(CONCAT_WS('\n',
            NULLIF(TRIM(im.observaciones), ''),
            CASE
                WHEN im.observaciones_docente IS NOT NULL AND TRIM(im.observaciones_docente) <> ''
                THEN CONCAT('Observación docente: ', TRIM(im.observaciones_docente))
                ELSE NULL
            END,
            CASE
                WHEN im.nota_definitiva IS NOT NULL
                     AND im.nota_final IS NOT NULL
                     AND im.nota_definitiva <> im.nota_final
                THEN CONCAT('Nota legacy: nota_final=', im.nota_final, ', nota_definitiva=', im.nota_definitiva)
                ELSE NULL
            END
        )),
        ''
    ) AS observaciones,

    im.activo,
    im.created_at,
    im.updated_at,
    im.deleted_at,
    im.created_by,
    im.updated_by,
    im.deleted_by
FROM inscripciones_materias im
LEFT JOIN asignaciones_docentes ad
    ON ad.id = im.asignacion_docente_id
LEFT JOIN cursos c
    ON c.id = ad.curso_id
ORDER BY im.id;

-- ============================================
-- 3) RESTAURAR AUTO_INCREMENT
-- ============================================

SET @next_auto_increment := (
    SELECT COALESCE(MAX(id), 0) + 1 FROM matriculas_materia
);

SET @sql_auto_increment := CONCAT(
    'ALTER TABLE matriculas_materia AUTO_INCREMENT = ',
    @next_auto_increment
);

PREPARE stmt_auto_increment FROM @sql_auto_increment;
EXECUTE stmt_auto_increment;
DEALLOCATE PREPARE stmt_auto_increment;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 4) VALIDACIONES
-- ============================================

SELECT
    'TOTAL_ORIGEN_INSCRIPCIONES_MATERIAS' AS validacion,
    COUNT(*) AS total
FROM inscripciones_materias;

SELECT
    'TOTAL_DESTINO_MATRICULAS_MATERIA' AS validacion,
    COUNT(*) AS total
FROM matriculas_materia;

SELECT
    'COMPARACION_TOTAL' AS validacion,
    (SELECT COUNT(*) FROM inscripciones_materias) AS total_origen,
    (SELECT COUNT(*) FROM matriculas_materia) AS total_destino,
    (SELECT COUNT(*) FROM inscripciones_materias) - (SELECT COUNT(*) FROM matriculas_materia) AS diferencia;

SELECT
    'RANGO_IDS_DESTINO' AS validacion,
    MIN(id) AS id_min,
    MAX(id) AS id_max
FROM matriculas_materia;

SELECT
    'SOFT_DELETED_DESTINO' AS validacion,
    COUNT(*) AS total
FROM matriculas_materia
WHERE deleted_at IS NOT NULL OR activo = 0;

SELECT
    estado,
    COUNT(*) AS total
FROM matriculas_materia
GROUP BY estado
ORDER BY estado;

SELECT
    'SIN_INSCRIPCION_VALIDADA' AS validacion,
    COUNT(*) AS total
FROM matriculas_materia mm
LEFT JOIN inscripciones i
    ON i.id = mm.inscripcion_id
WHERE mm.inscripcion_id IS NOT NULL
  AND i.id IS NULL;

SELECT
    'SIN_ASIGNACION_DOCENTE_VALIDADA' AS validacion,
    COUNT(*) AS total
FROM matriculas_materia mm
LEFT JOIN asignaciones_docentes ad
    ON ad.id = mm.asignacion_docente_id
WHERE mm.asignacion_docente_id IS NOT NULL
  AND ad.id IS NULL;

SELECT
    'SIN_ASIGNATURA_PLAN_ID' AS validacion,
    COUNT(*) AS total
FROM matriculas_materia
WHERE asignacion_docente_id IS NOT NULL
  AND asignatura_plan_id IS NULL;

SELECT
    'HISTORIAL_ESTADOS_INVALIDO' AS validacion,
    COUNT(*) AS total
FROM matriculas_materia
WHERE historial_estados IS NOT NULL
  AND JSON_VALID(historial_estados) = 0;

SELECT
    'AUTO_INCREMENT_ACTUAL' AS validacion,
    AUTO_INCREMENT AS valor
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'matriculas_materia';

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
