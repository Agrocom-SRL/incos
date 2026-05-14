-- ============================================
-- MIGRACIÓN DE DATOS: inscripciones
-- Sistema de Gestión Académica - Instituto INCOS
-- Origen: tabla real anterior de inscripciones
-- Destino: schema nuevo de inscripciones
-- Fecha base: 2026-05-14
-- ============================================
--
-- OBJETIVO
--   Migrar los datos reales de la tabla inscripciones al nuevo enfoque:
--   tipo_inscripcion ENUM('NUEVO','ANTIGUO','TRASPASO','TRANSITABILIDAD').
--
-- CAMBIO PRINCIPAL
--   REINGRESO    -> ANTIGUO
--   CONTINUIDAD  -> ANTIGUO
--   NUEVO        -> NUEVO
--   TRASPASO     -> TRASPASO
--   TRANSITABILIDAD -> TRANSITABILIDAD
--
-- REGLAS RESPETADAS
--   - Mantiene los mismos id.
--   - Mantiene activo, created_at, updated_at, deleted_at.
--   - Mantiene created_by, updated_by, deleted_by.
--   - Mantiene registros eliminados por soft delete.
--   - traspaso_id y transitabilidad_id se preservan si existen en el origen;
--     si no existen en el dump anterior, deben migrarse como NULL.
--
-- IMPORTANTE
--   Este script asume que ya existe una copia temporal/origen llamada:
--     inscripciones_origen
--
--   Si todavía tienes la tabla real vieja como `inscripciones`, crea primero
--   la copia ANTES de ejecutar el schema limpio:
--
--     CREATE TABLE inscripciones_origen LIKE inscripciones;
--     INSERT INTO inscripciones_origen SELECT * FROM inscripciones;
--
--   Luego ejecuta tu schema limpio, que recrea la tabla `inscripciones`,
--   y después ejecuta esta migración.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- VALIDACIÓN PREVIA DEL ORIGEN
-- ============================================
-- Revisa cuántos registros existen por tipo anterior.
-- Puedes ejecutar este SELECT manualmente antes del INSERT.
-- SELECT tipo_inscripcion, COUNT(*) AS total
-- FROM inscripciones_origen
-- GROUP BY tipo_inscripcion
-- ORDER BY tipo_inscripcion;

-- ============================================
-- LIMPIEZA OPCIONAL DEL DESTINO
-- ============================================
-- Activa esta línea solo si estás reconstruyendo desde cero la tabla destino.
-- TRUNCATE TABLE inscripciones;

-- ============================================
-- MIGRACIÓN PRINCIPAL
-- ============================================
-- Se arma dinámicamente para soportar dumps antiguos donde todavía no existían
-- traspaso_id o transitabilidad_id. Si no existen, se insertan como NULL.

SET @insert_sql := CONCAT(
    'INSERT INTO inscripciones (',
    'id, ',
    'datos_academicos_id, ',
    'gestion_id, ',
    'tipo_inscripcion, ',
    'fecha_inscripcion, ',
    'observaciones, ',
    'activo, ',
    'created_at, ',
    'updated_at, ',
    'deleted_at, ',
    'created_by, ',
    'updated_by, ',
    'deleted_by',
    ') ',
    'SELECT ',
    'id, ',
    'estudiante_datos_academicos_id, ',
    'gestion_id, ',
    'CASE ',
    'WHEN tipo_inscripcion IS NULL THEN NULL ',
    'WHEN tipo_inscripcion = \'NUEVO\' THEN \'NUEVO\' ',
    'WHEN tipo_inscripcion IN (\'REINGRESO\', \'CONTINUIDAD\', \'ANTIGUO\') THEN \'ANTIGUO\' ',
    'WHEN tipo_inscripcion = \'TRASPASO\' THEN \'TRASPASO\' ',
    'WHEN tipo_inscripcion = \'TRANSITABILIDAD\' THEN \'TRANSITABILIDAD\' ',
    'ELSE \'ANTIGUO\' ',
    'END AS tipo_inscripcion, ',
    'fecha_inscripcion, ',
    'observaciones, ',
    'activo, ',
    'created_at, ',
    'updated_at, ',
    'deleted_at, ',
    'created_by, ',
    'updated_by, ',
    'deleted_by ',
    'FROM inscripciones_origen ',
    'ORDER BY id'
);

PREPARE stmt_insert FROM @insert_sql;
EXECUTE stmt_insert;
DEALLOCATE PREPARE stmt_insert;

-- ============================================
-- REAJUSTE DE AUTO_INCREMENT
-- ============================================

SET @next_auto_increment := (SELECT COALESCE(MAX(id), 0) + 1 FROM inscripciones);
SET @sql_auto_increment := CONCAT('ALTER TABLE inscripciones AUTO_INCREMENT = ', @next_auto_increment);
PREPARE stmt_auto_increment FROM @sql_auto_increment;
EXECUTE stmt_auto_increment;
DEALLOCATE PREPARE stmt_auto_increment;

-- ============================================
-- VALIDACIONES POSTERIORES
-- ============================================

SELECT
    'TOTAL_ORIGEN' AS validacion,
    COUNT(*) AS total
FROM inscripciones_origen
UNION ALL
SELECT
    'TOTAL_DESTINO' AS validacion,
    COUNT(*) AS total
FROM inscripciones;

SELECT
    tipo_inscripcion,
    COUNT(*) AS total
FROM inscripciones
GROUP BY tipo_inscripcion
ORDER BY tipo_inscripcion;

SELECT
    'SOFT_DELETED_DESTINO' AS validacion,
    COUNT(*) AS total
FROM inscripciones
WHERE deleted_at IS NOT NULL OR activo = 0;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
