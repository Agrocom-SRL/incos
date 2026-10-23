-- ============================================
-- MIGRACIÓN DDL: Capacitación — ediciones de un mismo curso
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-10-23
--
-- Fuente de verdad (schema ya actualizado en el repo):
--   01-schemas/21-cursos-capacitacion.sql
--     - capacitaciones: edicion, curso_origen_id
--
-- Motivo: un curso se vuelve a ofertar en otra gestión (o varias veces en la misma) con
-- fechas, precios u horarios distintos. Cada oferta sigue siendo una fila de
-- `capacitaciones` (así cada inscripción conserva su historial), y estas columnas las
-- relacionan: `edicion` es la etiqueta de la oferta y `curso_origen_id` apunta a la oferta de
-- la que se copió («Nueva edición»). La gestión es el año de `fecha_inicio` (vista 155).
--
-- Aplicación IDEMPOTENTE (ALTER TABLE solo si falta cada pieza). Las ofertas existentes
-- quedan con edicion = NULL y curso_origen_id = NULL.
--
-- Orden: 1) este archivo, 2) recrear 03-views/155-vista-cursos-capacitacion-listado.sql.
-- ============================================

USE instituto_incos;

SET @cap_edicion := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = 'instituto_incos' AND table_name = 'capacitaciones' AND column_name = 'edicion'
);
SET @cap_ddl := IF(@cap_edicion = 0,
"ALTER TABLE instituto_incos.capacitaciones
    ADD COLUMN edicion VARCHAR(60) NULL COMMENT 'Etiqueta de la oferta (ej: 2027 – 1ª edición); distingue ofertas del mismo curso en una o varias gestiones' AFTER titulo,
    ADD COLUMN curso_origen_id INT NULL COMMENT 'Oferta de la que se copió esta edición (capacitaciones.id); NULL = curso original' AFTER edicion",
"SELECT 'capacitaciones.edicion/curso_origen_id: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cap_stmt FROM @cap_ddl;
EXECUTE cap_stmt;
DEALLOCATE PREPARE cap_stmt;

SET @cap_fk := (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = 'instituto_incos' AND table_name = 'capacitaciones'
      AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_capacitaciones_curso_origen'
);
SET @cap_fk_ddl := IF(@cap_fk = 0,
"ALTER TABLE instituto_incos.capacitaciones
    ADD CONSTRAINT fk_capacitaciones_curso_origen FOREIGN KEY (curso_origen_id) REFERENCES instituto_incos.capacitaciones(id) ON DELETE SET NULL",
"SELECT 'capacitaciones.fk_capacitaciones_curso_origen: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cap_fk_stmt FROM @cap_fk_ddl;
EXECUTE cap_fk_stmt;
DEALLOCATE PREPARE cap_fk_stmt;

SET @cap_idx := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = 'instituto_incos' AND table_name = 'capacitaciones' AND index_name = 'idx_curso_origen_id'
);
SET @cap_idx_ddl := IF(@cap_idx = 0,
"ALTER TABLE instituto_incos.capacitaciones ADD INDEX idx_curso_origen_id (curso_origen_id) COMMENT 'Ediciones derivadas de una oferta'",
"SELECT 'capacitaciones.idx_curso_origen_id: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cap_idx_stmt FROM @cap_idx_ddl;
EXECUTE cap_idx_stmt;
DEALLOCATE PREPARE cap_idx_stmt;

-- VERIFICACIÓN (solo lectura)
SELECT table_name, column_name, is_nullable, column_type
FROM information_schema.columns
WHERE table_schema = 'instituto_incos' AND table_name = 'capacitaciones'
  AND column_name IN ('edicion', 'curso_origen_id');
