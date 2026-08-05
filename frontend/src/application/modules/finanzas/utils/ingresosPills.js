/**
 * Mapea el ORIGEN de un ingreso (APORTE | CAPACITACION) a su etiqueta y clase
 * de pill (StatusPill), mismo enfoque que `pagosPills.js` (badge chico bajo el
 * nombre de la persona). CSS en
 * presentation/modules/finanzas/pagos/styles/pagos-list.css.
 */

const ORIGEN_LABEL = {
  APORTE: 'Aporte',
  CAPACITACION: 'Capacitación',
};

/** Etiqueta legible del origen del ingreso. */
export const formatOrigenIngreso = (origen) => ORIGEN_LABEL[origen] ?? 'Ingreso';

/**
 * Clase del pill (StatusPill) que tiñe el origen del ingreso:
 *   APORTE       → azul (info) — aporte académico (pago_cuotas)
 *   CAPACITACION → ámbar (warning) — pago de capacitación (capacitacion_pagos)
 */
export const getOrigenIngresoPillClass = (origen) =>
  origen === 'CAPACITACION'
    ? 'pago-pill pago-pill--origen-capacitacion'
    : 'pago-pill pago-pill--origen-aporte';
