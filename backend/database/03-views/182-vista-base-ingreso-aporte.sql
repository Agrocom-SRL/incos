-- ============================================
-- VISTA BASE: vista_base_ingreso_aporte
-- Transacciones individuales de pago de aporte (pago_cuotas) con datos de
-- estudiante, gestión y carrera para el registro de ingresos (Finanzas).
--
-- Propósito: Vista base transaccional (1 fila = 1 pago) que une pago_cuotas +
-- pago_aporte + estudiantes + carrera reciente del estudiante (reutiliza
-- vista_base_estudiante_carrera_reciente, igual que vista_base_pago_aporte_info
-- en 39-vista-base-pago-aporte-info.sql). Consumida por vista_ingresos_listado
-- (184) junto con vista_base_ingreso_capacitacion (183).
--
-- Relaciones:
-- - pago_cuotas.pago_aporte_id → pago_aporte.id
-- - pago_aporte.estudiante_id → estudiantes.id
-- - pago_aporte.estudiante_id → vista_base_estudiante_carrera_reciente (LEFT, carrera reciente)
--
-- Filtro: fila con monto > 0, pago_cuotas y pago_aporte activos/no eliminados.
-- Excluye automáticamente las cuotas en 0 usadas solo para disparar el
-- compromiso de pago cuando la beca cubre el 100% (ver
-- RegisterAporteVoluntarioUseCase.js, variable esPagoGratuito).
--
-- Dependencias (ejecutar antes):
-- - 38-vista-base-estudiante-carrera-reciente.sql
--
-- Uso:
-- SELECT * FROM vista_base_ingreso_aporte ORDER BY fecha_pago DESC;
-- SELECT * FROM vista_base_ingreso_aporte WHERE pago_aporte_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_ingreso_aporte;

CREATE VIEW vista_base_ingreso_aporte AS
SELECT
  pc.id,
  pc.pago_aporte_id,
  pc.numero_recibo,
  pc.fecha_pago,
  pc.monto,
  pc.metodo_pago_id,
  pc.descripcion,
  pa.gestion_id,
  est.codigo_estudiante,
  est.apellido_paterno,
  est.apellido_materno,
  est.nombres,
  cr.carrera_nombre
FROM pago_cuotas pc
INNER JOIN pago_aporte pa ON pa.id = pc.pago_aporte_id
  AND pa.activo = TRUE
  AND pa.deleted_at IS NULL
INNER JOIN estudiantes est ON est.id = pa.estudiante_id
  AND est.activo = TRUE
  AND est.deleted_at IS NULL
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = pa.estudiante_id
WHERE pc.monto > 0
  AND pc.activo = TRUE
  AND pc.deleted_at IS NULL;
