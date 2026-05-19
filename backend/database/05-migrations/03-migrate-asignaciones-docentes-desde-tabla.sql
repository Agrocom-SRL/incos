-- ============================================
-- MIGRACIÓN DE DATOS: asignaciones_docentes
-- Origen: tabla legacy asignaciones_docentes_origen
-- Destino: schema nuevo en 07-estructura-academica-parte3.sql
--
-- Uso: ejecutar cuando existen:
--   - asignaciones_docentes_origen  (copia de la tabla importada / legacy)
--   - asignaciones_docentes         (tabla recreada con columnas nuevas)
--
-- Columnas nuevas en destino (valores por defecto en migración):
--   teorico_override, practico_override          -> NULL
--   politica_asistencia                          -> 'NO_AFECTA'
--   peso_asistencia, minimo_asistencia,
--   nota_reprobada                               -> NULL
--
-- IMPORTANTE — orden de ejecución si reconstruyes todo el módulo:
--   1. Backup: CREATE TABLE asignaciones_docentes_origen ...
--   2. Schema: 07-estructura-academica-parte3.sql (recrea asignaciones_docentes)
--   3. Este script (03)
--   4. 02-migrate-matriculas-materia-desde-tabla.sql (matriculas referencian asignacion_docente_id)
--
-- Backup previo (ejecutar ANTES del schema limpio):
--   CREATE TABLE asignaciones_docentes_origen LIKE asignaciones_docentes;
--   INSERT INTO asignaciones_docentes_origen SELECT * FROM asignaciones_docentes;
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1) LIMPIAR DESTINO
-- ============================================
-- La tabla destino se recarga desde el origen legacy.
-- Si ya tienes asignaciones nuevas manuales que NO quieres perder, NO ejecutes esta línea.

DELETE FROM asignaciones_docentes;

-- ============================================
-- 2) MIGRACIÓN PRINCIPAL
-- ============================================
-- Mapeo columnas legacy -> nuevo:
--   id, gestion_plan_id, curso_id, docente_id, carga_horaria  -> se conservan
--   vigente, motivo, fecha_asignacion                         -> se conservan
--   auditoría y soft delete                                   -> se conservan
--   teorico_override, practico_override                       -> NULL
--   politica_asistencia                                       -> 'NO_AFECTA'
--   peso_asistencia, minimo_asistencia, nota_reprobada        -> NULL
-- ============================================

INSERT INTO asignaciones_docentes (
    id,
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    teorico_override,
    practico_override,
    politica_asistencia,
    peso_asistencia,
    minimo_asistencia,
    nota_reprobada,
    fecha_asignacion,
    motivo,
    vigente,
    activo,
    created_at,
    updated_at,
    deleted_at,
    created_by,
    updated_by,
    deleted_by
)
SELECT
    o.id,
    o.gestion_plan_id,
    o.curso_id,
    o.docente_id,
    o.carga_horaria,
    NULL AS teorico_override,
    NULL AS practico_override,
    'NO_AFECTA' AS politica_asistencia,
    NULL AS peso_asistencia,
    NULL AS minimo_asistencia,
    NULL AS nota_reprobada,
    o.fecha_asignacion,
    o.motivo,
    COALESCE(o.vigente, 1) AS vigente,
    o.activo,
    o.created_at,
    o.updated_at,
    o.deleted_at,
    o.created_by,
    o.updated_by,
    o.deleted_by
FROM asignaciones_docentes_origen o
ORDER BY o.id;

-- ============================================
-- 3) RESTAURAR AUTO_INCREMENT
-- ============================================

SET @next_auto_increment := (
    SELECT COALESCE(MAX(id), 0) + 1 FROM asignaciones_docentes
);

SET @sql_auto_increment := CONCAT(
    'ALTER TABLE asignaciones_docentes AUTO_INCREMENT = ',
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
    'TOTAL_ORIGEN_ASIGNACIONES_DOCENTES' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes_origen;

SELECT
    'TOTAL_DESTINO_ASIGNACIONES_DOCENTES' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes;

SELECT
    'COMPARACION_TOTAL' AS validacion,
    (SELECT COUNT(*) FROM asignaciones_docentes_origen) AS total_origen,
    (SELECT COUNT(*) FROM asignaciones_docentes) AS total_destino,
    (SELECT COUNT(*) FROM asignaciones_docentes_origen)
        - (SELECT COUNT(*) FROM asignaciones_docentes) AS diferencia;

SELECT
    'RANGO_IDS_DESTINO' AS validacion,
    MIN(id) AS id_min,
    MAX(id) AS id_max
FROM asignaciones_docentes;

SELECT
    'SOFT_DELETED_DESTINO' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes
WHERE deleted_at IS NOT NULL OR activo = 0;

SELECT
    vigente,
    COUNT(*) AS total
FROM asignaciones_docentes
GROUP BY vigente
ORDER BY vigente;

SELECT
    politica_asistencia,
    COUNT(*) AS total
FROM asignaciones_docentes
GROUP BY politica_asistencia
ORDER BY politica_asistencia;

SELECT
    'SIN_GESTION_PLAN_VALIDADA' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes ad
LEFT JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
WHERE ad.gestion_plan_id IS NOT NULL
  AND gp.id IS NULL;

SELECT
    'SIN_CURSO_VALIDADO' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes ad
LEFT JOIN cursos c ON c.id = ad.curso_id
WHERE ad.curso_id IS NOT NULL
  AND c.id IS NULL;

SELECT
    'SIN_DOCENTE_VALIDADO' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes ad
LEFT JOIN docentes d ON d.id = ad.docente_id
WHERE ad.docente_id IS NOT NULL
  AND d.id IS NULL;

SELECT
    'CON_OVERRIDE_TEORICO_PRACTICO' AS validacion,
    COUNT(*) AS total
FROM asignaciones_docentes
WHERE teorico_override IS NOT NULL
   OR practico_override IS NOT NULL;

SELECT
    'AUTO_INCREMENT_ACTUAL' AS validacion,
    AUTO_INCREMENT AS valor
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'asignaciones_docentes';

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
