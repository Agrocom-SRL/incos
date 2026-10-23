-- ============================================
-- MIGRACIÓN DDL: Capacitación — matrícula por grupo
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-10-23
--
-- Fuente de verdad (schema ya actualizado en el repo):
--   01-schemas/21-cursos-capacitacion.sql
--     - capacitacion_grupos: costo_matricula
--
-- Motivo: el costo del CURSO es fijo (se deposita a la entidad certificadora),
-- pero la MATRÍCULA la fija el instituto y puede variar por grupo (p. ej. el
-- grupo Intensivo cuesta distinto que el Regular). Cada grupo guarda su
-- matrícula; NULL = el grupo usa capacitaciones.costo_matricula (así los grupos
-- existentes siguen cobrando lo mismo que hoy).
--
-- Aplicación IDEMPOTENTE: corre solo si la columna aún no existe. Las
-- inscripciones ya creadas conservan su snapshot capacitacion_inscritos.monto_matricula.
-- ============================================

USE instituto_incos;

SET @cg_costo := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'capacitacion_grupos'
      AND column_name = 'costo_matricula'
);
SET @cg_ddl := IF(@cg_costo = 0,
"ALTER TABLE instituto_incos.capacitacion_grupos
    ADD COLUMN costo_matricula DECIMAL(10,2) NULL COMMENT 'Matrícula en Bs de ESTE grupo (p. ej. Regular vs Intensivo); NULL = usa capacitaciones.costo_matricula. Solo aplica si el curso cobra_matricula' AFTER cupo_maximo",
"SELECT 'capacitacion_grupos.costo_matricula: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cg_stmt FROM @cg_ddl;
EXECUTE cg_stmt;
DEALLOCATE PREPARE cg_stmt;

-- ============================================
-- VERIFICACIÓN (solo lectura, ejecutar tras aplicar)
-- ============================================

SELECT table_name, column_name, is_nullable, column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND table_name = 'capacitacion_grupos'
  AND column_name = 'costo_matricula';
