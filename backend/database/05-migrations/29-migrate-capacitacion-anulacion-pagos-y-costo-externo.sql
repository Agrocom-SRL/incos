-- ============================================
-- MIGRACIÓN DDL: Capacitación — anulación de pagos y costo del curso externo
-- Sistema de Gestión Académica - Instituto INCOS
-- Fecha de redacción: 2026-10-22
--
-- Fuente de verdad (schema ya actualizado en el repo):
--   01-schemas/21-cursos-capacitacion.sql
--     - capacitacion_pagos: anulado, motivo_anulacion, fecha_anulacion, anulado_por
--     - capacitacion_requisitos: acredita_pago_curso
--
-- Motivo:
--  1) Corregir errores de caja: un pago equivocado se ANULA (con motivo
--     obligatorio) conservando el historial. El pago anulado no cuenta en
--     totales, saldos ni ingresos (la vista 183 lo excluye).
--  2) Cursos con entidad certificadora: el costo del curso se deposita a otra
--     entidad y NO se registra como pago en el sistema. La prueba es un
--     requisito (fotocopia del depósito) marcado con `acredita_pago_curso`.
--
-- Estas tablas ya tienen datos reales (dump del servidor), por eso se aplica
-- con ALTER TABLE (no DROP/CREATE) y de forma IDEMPOTENTE: cada cambio corre
-- solo si la columna/índice aún no existe. Los pagos existentes quedan con
-- anulado = 0 y los requisitos existentes con acredita_pago_curso = 0, es
-- decir, el comportamiento actual no cambia.
--
-- Orden de aplicación:
--   1. Este archivo.
--   2. 03-views/183-vista-base-ingreso-capacitacion.sql (excluye pagos anulados;
--      la 184 se alimenta de la 183 y no cambia).
-- ============================================

USE instituto_incos;

-- ---------- capacitacion_pagos.anulado ----------
SET @cp_anulado := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'capacitacion_pagos'
      AND column_name = 'anulado'
);
SET @cp_ddl := IF(@cp_anulado = 0,
"ALTER TABLE instituto_incos.capacitacion_pagos
    ADD COLUMN anulado BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Pago anulado por error: se conserva el historial pero NO cuenta en totales, saldos ni ingresos' AFTER comprobante_nombre,
    ADD COLUMN motivo_anulacion VARCHAR(500) NULL COMMENT 'Motivo obligatorio de la anulación' AFTER anulado,
    ADD COLUMN fecha_anulacion DATETIME NULL COMMENT 'Momento en que se anuló el pago' AFTER motivo_anulacion,
    ADD COLUMN anulado_por INT NULL COMMENT 'Usuario que anuló el pago' AFTER fecha_anulacion",
"SELECT 'capacitacion_pagos.anulado: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cp_stmt FROM @cp_ddl;
EXECUTE cp_stmt;
DEALLOCATE PREPARE cp_stmt;

-- ---------- capacitacion_pagos.idx_anulado ----------
SET @cp_idx := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'capacitacion_pagos'
      AND index_name = 'idx_anulado'
);
SET @cp_idx_ddl := IF(@cp_idx = 0,
"ALTER TABLE instituto_incos.capacitacion_pagos ADD INDEX idx_anulado (anulado) COMMENT 'Filtrado de pagos anulados'",
"SELECT 'capacitacion_pagos.idx_anulado: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cp_idx_stmt FROM @cp_idx_ddl;
EXECUTE cp_idx_stmt;
DEALLOCATE PREPARE cp_idx_stmt;

-- ---------- capacitacion_requisitos.acredita_pago_curso ----------
SET @cr_acredita := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = 'instituto_incos'
      AND table_name = 'capacitacion_requisitos'
      AND column_name = 'acredita_pago_curso'
);
SET @cr_ddl := IF(@cr_acredita = 0,
"ALTER TABLE instituto_incos.capacitacion_requisitos
    ADD COLUMN acredita_pago_curso BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Entregarlo acredita el pago del costo del curso a la entidad certificadora (fotocopia del depósito). Solo con capacitaciones.entidad_certificadora; a lo sumo un requisito por curso (validado en lógica)' AFTER obligatorio",
"SELECT 'capacitacion_requisitos.acredita_pago_curso: ya estaba aplicado, sin cambios' AS aviso");
PREPARE cr_stmt FROM @cr_ddl;
EXECUTE cr_stmt;
DEALLOCATE PREPARE cr_stmt;

-- ============================================
-- VERIFICACIÓN (solo lectura, ejecutar tras aplicar)
-- ============================================

SELECT table_name, column_name, is_nullable, column_type, column_default
FROM information_schema.columns
WHERE table_schema = 'instituto_incos'
  AND (
    (table_name = 'capacitacion_pagos'
      AND column_name IN ('anulado', 'motivo_anulacion', 'fecha_anulacion', 'anulado_por'))
    OR (table_name = 'capacitacion_requisitos' AND column_name = 'acredita_pago_curso')
  )
ORDER BY table_name, ordinal_position;
