-- ============================================
-- MIGRACIÓN DDL: Informe de suficiencia de modalidad de graduación (TIT)
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-08-17
--
-- Fuente de verdad (schemas ya corregidos en el repo):
--   01-schemas/22-modalidades-grado.sql          (proyectos_grado: estado + fecha_informe_suficiencia)
--   01-schemas/23-tutorias-acompanamiento.sql    (dictamenes_proyecto: tipo + resultado)
--
-- Motivo (docs/plan/matricula-arrastre-choques-centralizador.md, sección
-- "Titulación — contrato de handoff"): se agrega la etapa SUFICIENCIA
-- (informe de suficiencia del tutor, previo a la predefensa) entre
-- DESARROLLO y PREDEFENSA, y la exención de defensa (salto directo
-- APROBADO_PREDEFENSA → APROBADO cuando notaPredefensa > 90, sin columna
-- nueva: reutiliza notaFinal/fechaAprobacion existentes).
--
-- `proyectos_grado` y `dictamenes_proyecto` YA ESTÁN DESPLEGADAS con datos
-- reales (módulo TIT en uso), así que este delta se aplica vía ALTER TABLE
-- (no DROP/CREATE) y de forma IDEMPOTENTE: cada bloque solo corre si el
-- ALTER correspondiente no se aplicó todavía.
--
-- IMPORTANTE: MySQL reconstruye la tabla (ALGORITHM=COPY) al insertar un
-- valor de ENUM en medio de la lista (remapea por VALOR, no por índice: los
-- datos existentes quedan intactos). Bloqueo breve de escritura mientras se
-- reconstruye; ambas tablas son pequeñas (impacto mínimo), mismo criterio
-- que 05-migrations/26-migrate-alter-tablas-existentes.sql (REINCORPORACION).
-- ============================================

USE instituto_incos;

-- ============================================
-- 1) proyectos_grado — estado (agrega 'SUFICIENCIA' entre 'DESARROLLO' y
--    'PREDEFENSA'; agrega 'APROBADO' como destino directo desde
--    'APROBADO_PREDEFENSA' YA está cubierto por la máquina de estados en
--    aplicación, no requiere cambio de ENUM) + fecha_informe_suficiencia.
--    IDEMPOTENTE: solo corre si la columna fecha_informe_suficiencia no
--    existe todavía.
-- ============================================

SET @pg_aplicado := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'proyectos_grado'
      AND column_name = 'fecha_informe_suficiencia'
);

SET @pg_ddl := IF(@pg_aplicado = 0,
"ALTER TABLE instituto_incos.proyectos_grado
    ADD COLUMN fecha_informe_suficiencia DATE NULL COMMENT 'Fecha en que se registró el informe de suficiencia del tutor' AFTER fecha_inicio_desarrollo,
    MODIFY COLUMN estado ENUM(
        'PERFIL',
        'APROBADO_PERFIL',
        'DESARROLLO',
        'SUFICIENCIA',
        'PREDEFENSA',
        'APROBADO_PREDEFENSA',
        'DEFENSA',
        'APROBADO',
        'REPROBADO',
        'CANCELADO'
    ) DEFAULT 'PERFIL' COMMENT 'Estado actual del proyecto'",
"SELECT '1) proyectos_grado.fecha_informe_suficiencia/estado: ya estaba aplicado, sin cambios' AS aviso");

PREPARE pg_stmt FROM @pg_ddl;
EXECUTE pg_stmt;
DEALLOCATE PREPARE pg_stmt;

-- ============================================
-- 2) dictamenes_proyecto — tipo (agrega 'INFORME_SUFICIENCIA') + resultado
--    (agrega 'NO_APROBADO', veredicto del informe de suficiencia). Sin
--    columna nueva que gatille la idempotencia: se verifica que el valor
--    'INFORME_SUFICIENCIA' ya esté en el ENUM de `tipo`.
-- ============================================

SET @dp_aplicado := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'dictamenes_proyecto'
      AND column_name = 'tipo'
      AND column_type LIKE '%INFORME_SUFICIENCIA%'
);

SET @dp_ddl := IF(@dp_aplicado = 0,
"ALTER TABLE instituto_incos.dictamenes_proyecto
    MODIFY COLUMN tipo ENUM('VIABILIDAD_TECNICA', 'DESIGNACION_OFICIAL', 'INFORME_SUFICIENCIA') NOT NULL COMMENT 'VIABILIDAD_TECNICA: informe de aprobación final del tutor | DESIGNACION_OFICIAL: informe de designación de tutor para la DDE | INFORME_SUFICIENCIA: informe del tutor previo a la predefensa',
    MODIFY COLUMN resultado ENUM('APROBADO', 'OBSERVADO', 'RECHAZADO', 'NO_APROBADO') NULL COMMENT 'Resultado del dictamen (VIABILIDAD_TECNICA: NULL, documentación oficial fuera del alcance del sistema | INFORME_SUFICIENCIA: APROBADO/NO_APROBADO, veredicto del tutor)'",
"SELECT '2) dictamenes_proyecto.tipo/resultado: ya estaba aplicado, sin cambios' AS aviso");

PREPARE dp_stmt FROM @dp_ddl;
EXECUTE dp_stmt;
DEALLOCATE PREPARE dp_stmt;

-- ============================================
-- VERIFICACIÓN (solo lectura, ejecutar tras aplicar)
-- ============================================

-- a) Columna nueva presente (espera 1 fila)
SELECT table_name, column_name, is_nullable, column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'proyectos_grado'
  AND column_name = 'fecha_informe_suficiencia';

-- b) ENUM de proyectos_grado.estado con SUFICIENCIA (espera 1 fila)
SELECT column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'proyectos_grado'
  AND column_name = 'estado'
  AND column_type LIKE '%SUFICIENCIA%';

-- c) ENUMs de dictamenes_proyecto con los nuevos valores (espera 2 filas)
SELECT column_name, column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'dictamenes_proyecto'
  AND ((column_name = 'tipo' AND column_type LIKE '%INFORME_SUFICIENCIA%')
    OR (column_name = 'resultado' AND column_type LIKE '%NO_APROBADO%'));

-- d) Conteo de datos preservados (comparar con los conteos previos al ALTER)
SELECT 'proyectos_grado' AS tabla, COUNT(*) AS filas FROM instituto_incos.proyectos_grado
UNION ALL SELECT 'dictamenes_proyecto', COUNT(*) FROM instituto_incos.dictamenes_proyecto;
