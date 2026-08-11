-- ============================================
-- MIGRACIÓN DDL: pasantias_empresas.nombre_comercial
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-08-09
--
-- Fuente de verdad (schema ya corregido en el repo):
--   01-schemas/24-pasantias.sql (tabla pasantias_empresas)
--
-- Motivo: el catálogo de empresas solo tenía la razón social (columna
-- `nombre`). Varias empresas se conocen por un nombre comercial distinto de
-- su razón social (ej. razón social "Embotelladora Boliviana S.A.", nombre
-- comercial "Embol"). Se agrega `nombre_comercial` como campo opcional.
--
-- Esta tabla puede tener filas ya cargadas en el servidor (catálogo en uso),
-- así que se aplica vía ALTER TABLE (no DROP/CREATE) y de forma IDEMPOTENTE:
-- solo corre si la columna no existe todavía.
-- ============================================

USE instituto_incos;

SET @pe_aplicado := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'pasantias_empresas'
      AND column_name = 'nombre_comercial'
);

SET @pe_ddl := IF(@pe_aplicado = 0,
"ALTER TABLE pasantias_empresas
    ADD COLUMN nombre_comercial VARCHAR(200) NULL COMMENT 'Nombre comercial o de fantasía, si difiere de la razón social (ej. razón social \"Embotelladora Boliviana S.A.\", nombre comercial \"Embol\")' AFTER nombre,
    ADD INDEX idx_nombre_comercial (nombre_comercial) COMMENT 'Búsqueda por nombre comercial'",
"SELECT 'pasantias_empresas.nombre_comercial: ya estaba aplicado, sin cambios' AS aviso");


-- ============================================
-- VERIFICACIÓN (solo lectura, ejecutar tras aplicar)
-- ============================================

SELECT table_name, column_name, is_nullable, column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'pasantias_empresas'
  AND column_name = 'nombre_comercial';
