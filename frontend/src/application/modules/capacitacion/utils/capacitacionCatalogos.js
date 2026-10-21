/**
 * Catálogos cerrados del dominio Capacitación (espejo de
 * `capacitacion.constants.js` del backend): modalidad del curso y concepto de
 * pago. Fuente única de etiquetas/opciones de select para formularios, fichas y
 * tablas — ninguna pantalla repite estos textos.
 */

/** Modalidad del curso (capacitaciones.modalidad). */
export const MODALIDAD_CURSO = {
  VIRTUAL: 'VIRTUAL',
  PRESENCIAL: 'PRESENCIAL',
  SEMIPRESENCIAL: 'SEMIPRESENCIAL',
};

export const MODALIDAD_CURSO_LABELS = {
  [MODALIDAD_CURSO.VIRTUAL]: 'Virtual',
  [MODALIDAD_CURSO.PRESENCIAL]: 'Presencial',
  [MODALIDAD_CURSO.SEMIPRESENCIAL]: 'Semipresencial',
};

export const MODALIDAD_CURSO_OPTIONS = Object.entries(MODALIDAD_CURSO_LABELS).map(
  ([value, label]) => ({ value, label }),
);

/** Etiqueta legible de la modalidad (null si no hay dato). */
export const formatModalidadCurso = (modalidad) =>
  MODALIDAD_CURSO_LABELS[modalidad] ?? modalidad ?? null;

/**
 * Concepto de pago (capacitacion_pagos.concepto). MATRICULA se paga en
 * secretaría del instituto; CURSO se deposita a la entidad certificadora.
 */
export const CONCEPTO_PAGO = { MATRICULA: 'MATRICULA', CURSO: 'CURSO' };

export const CONCEPTO_PAGO_LABELS = {
  MATRICULA: 'Matrícula (instituto)',
  CURSO: 'Costo del curso (entidad certificadora)',
};

export const CONCEPTO_PAGO_OPTIONS = Object.entries(CONCEPTO_PAGO_LABELS).map(
  ([value, label]) => ({ value, label }),
);

/**
 * Opciones de concepto solo para los conceptos con saldo > 0: un concepto no
 * cobrado (o ya saldado) no se ofrece ni se pide.
 * @param {Object} saldosPorConcepto - { MATRICULA: n, CURSO: n }
 */
export const buildConceptoOptions = (saldosPorConcepto = {}) =>
  CONCEPTO_PAGO_OPTIONS.filter((o) => Number(saldosPorConcepto[o.value]) > 0);

/** Etiqueta legible del concepto de pago. */
export const formatConceptoPago = (concepto) =>
  CONCEPTO_PAGO_LABELS[concepto] ?? concepto ?? '—';
