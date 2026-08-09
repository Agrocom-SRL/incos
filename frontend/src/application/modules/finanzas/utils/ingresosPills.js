/**
 * Mapea el ORIGEN de un ingreso (APORTE | CAPACITACION) a su etiqueta y clase
 * de pill (StatusPill), sobre las clases GLOBALES `cfg-materia-pill--*`
 * (`presentation/styles/components/atoms/table-cells.css`) — mismo lenguaje
 * visual que el resto del sistema (p. ej. `documentacionTipoPill.js`), sin CSS
 * propio del módulo.
 */

const ORIGEN_LABEL = {
  APORTE: 'Aporte',
  CAPACITACION: 'Capacitación',
};

/** Etiqueta legible del origen del ingreso. */
export const formatOrigenIngreso = (origen) => ORIGEN_LABEL[origen] ?? 'Ingreso';

/**
 * Clase del pill (StatusPill) que CATEGORIZA el origen del ingreso (proceso que
 * lo generó, no un estado de severidad):
 *   APORTE       → primary (verde institucional) — aporte académico (pago_cuotas),
 *                  el flujo principal del instituto (Matrícula).
 *   CAPACITACION → purple — programa complementario (capacitacion_pagos), mismo
 *                  tono categórico que usa `documentacionTipoPill` para procesos
 *                  secundarios (TITULACION/BECA).
 */
export const getOrigenIngresoPillClass = (origen) =>
  origen === 'CAPACITACION'
    ? 'cfg-materia-pill cfg-materia-pill--purple'
    : 'cfg-materia-pill cfg-materia-pill--primary';
