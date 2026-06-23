-- ============================================
-- MIGRACION DE DATOS: compromisos_pago
-- Sistema de Gestion Academica - Instituto INCOS
-- Origen: derivado de pago_aporte (21) + pago_cuotas (22)
-- Destino: tabla compromisos_pago (schema 14)
-- ============================================
-- Regla de negocio: el compromiso de pago se genera al registrar la PRIMERA
-- cuota del aporte. La fecha de compromiso = fecha de la primera cuota + 90 dias
-- (plazo institucional, hardcodeado en el registro de pagos).
--
-- ALCANCE: SOLO aportes con saldo pendiente (estado = 'PARCIAL', matriculados con
-- mora). Los aportes CANCELADO no generan compromiso de seguimiento. Estos casos
-- antes anotaban el compromiso en texto libre en pago_cuotas.descripcion; aqui se
-- normalizan a la tabla compromisos_pago.
--
-- ESTADO derivado a la fecha de ejecucion:
--   - fecha_compromiso < hoy  -> 'INCUMPLIDO' (vencido sin saldar)
--   - fecha_compromiso >= hoy -> 'VIGENTE'
-- (el estado "proxima a vencer" es derivado en la UI, no se almacena)
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO compromisos_pago
    (pago_aporte_id, fecha_compromiso, observacion, estado, activo, created_at, updated_at)
SELECT
    pa.id,
    DATE_ADD(fc.primera_fecha, INTERVAL 90 DAY) AS fecha_compromiso,
    'Compromiso (primera cuota + 90 dias)' AS observacion,
    CASE
        WHEN DATE_ADD(fc.primera_fecha, INTERVAL 90 DAY) < CURDATE() THEN 'INCUMPLIDO'
        ELSE 'VIGENTE'
    END AS estado,
    1 AS activo,
    NOW() AS created_at,
    NOW() AS updated_at
FROM pago_aporte pa
JOIN (
    SELECT pago_aporte_id, MIN(fecha_pago) AS primera_fecha
    FROM pago_cuotas
    WHERE activo = 1 AND deleted_at IS NULL
    GROUP BY pago_aporte_id
) fc ON fc.pago_aporte_id = pa.id
WHERE pa.activo = 1
  AND pa.deleted_at IS NULL
  AND pa.estado = 'PARCIAL'
  -- Idempotente: no duplicar si la cabecera ya tiene un compromiso activo
  -- (p. ej. creado al registrar el primer pago desde la pantalla de pagos).
  AND NOT EXISTS (
      SELECT 1 FROM compromisos_pago cp
      WHERE cp.pago_aporte_id = pa.id
        AND cp.activo = 1
        AND cp.deleted_at IS NULL
  );

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- Inserta 1 compromiso VIGENTE/INCUMPLIDO por cada aporte PARCIAL (30 deudores
-- con mora en la gestion 2026). fecha = primera cuota + 90 dias.
-- ============================================
-- FIN DEL SEEDER
-- ============================================
