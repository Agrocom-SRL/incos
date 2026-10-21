-- ============================================
-- VISTA BASE: vista_base_ingreso_capacitacion
-- Transacciones individuales de pago de capacitación (capacitacion_pagos)
-- con datos del participante y del curso para el registro de ingresos
-- (Finanzas).
--
-- Propósito: Vista base transaccional (1 fila = 1 pago) que une
-- capacitacion_pagos + capacitacion_inscritos + participantes +
-- capacitaciones. Consumida por vista_ingresos_listado (184) junto con
-- vista_base_ingreso_aporte (182).
--
-- Matrícula y costo del curso son instituciones distintas: `concepto`
-- (MATRICULA | CURSO) distingue el pago y `cobra_instituto` marca si el dinero
-- ingresa al instituto (1) o a la entidad certificadora (0):
-- cobra_instituto = (concepto = 'MATRICULA' OR el curso no tiene entidad certificadora).
-- Los totales de ingreso del instituto deben sumar solo cobra_instituto = 1.
--
-- Relaciones:
-- - capacitacion_pagos.capacitacion_inscrito_id → capacitacion_inscritos.id
-- - capacitacion_inscritos.participante_id → participantes.id
-- - capacitacion_inscritos.capacitacion_id → capacitaciones.id
--
-- Filtro: fila con monto > 0, capacitacion_pagos y capacitacion_inscritos
-- activos/no eliminados. capacitacion_pagos.monto siempre es > 0 por
-- validación en RegisterPagoCapacitacionUseCase.js; el filtro monto > 0 aquí
-- es higiene/consistencia con vista_base_ingreso_aporte.
--
-- Uso:
-- SELECT * FROM vista_base_ingreso_capacitacion ORDER BY fecha_pago DESC;
-- SELECT * FROM vista_base_ingreso_capacitacion WHERE capacitacion_inscrito_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_ingreso_capacitacion;

CREATE VIEW vista_base_ingreso_capacitacion AS
SELECT
  cp.id,
  cp.capacitacion_inscrito_id,
  cp.numero_recibo,
  cp.fecha_pago,
  cp.monto,
  cp.metodo_pago_id,
  cp.concepto,
  CASE
    WHEN cp.concepto = 'MATRICULA' OR cap.entidad_certificadora IS NULL THEN 1
    ELSE 0
  END AS cobra_instituto,
  cp.observaciones AS descripcion,
  part.ci,
  part.apellido_paterno,
  part.apellido_materno,
  part.nombres,
  cap.titulo AS curso_titulo
FROM capacitacion_pagos cp
INNER JOIN capacitacion_inscritos cinsc ON cinsc.id = cp.capacitacion_inscrito_id
  AND cinsc.activo = TRUE
  AND cinsc.deleted_at IS NULL
INNER JOIN participantes part ON part.id = cinsc.participante_id
  AND part.activo = TRUE
  AND part.deleted_at IS NULL
INNER JOIN capacitaciones cap ON cap.id = cinsc.capacitacion_id
  AND cap.activo = TRUE
  AND cap.deleted_at IS NULL
WHERE cp.monto > 0
  AND cp.activo = TRUE
  AND cp.deleted_at IS NULL;
