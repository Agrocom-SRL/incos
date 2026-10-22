/**
 * Reglas puras (sin React) de los pagos de una inscripción de capacitación:
 * qué conceptos se ofrecen, cuánto saldo hay al corregir un pago y cuándo un
 * pago se puede corregir o anular. El backend revalida todo.
 */

import {
  CONCEPTO_PAGO,
  CONCEPTO_PAGO_OPTIONS,
  buildConceptoOptions,
} from './capacitacionCatalogos';
import { ESTADOS_INSCRIPCION_CAP_VIGENTES } from './capacitacionPills';

/**
 * Saldos por concepto que se pueden cobrar al REGISTRAR un pago. Con el costo del
 * curso externo (entidad certificadora) el curso no se cobra aquí: saldo 0, así
 * no se ofrece el concepto CURSO.
 */
export const saldosCobrablesInscripcion = (inscripcion) => ({
  [CONCEPTO_PAGO.MATRICULA]: Number(inscripcion?.saldoMatricula) || 0,
  [CONCEPTO_PAGO.CURSO]: inscripcion?.pagoCursoExterno ? 0 : Number(inscripcion?.saldoCurso) || 0,
});

/** Concepto sugerido al registrar: el primero con saldo (matrícula antes que curso). */
export const conceptoSugerido = (saldosPorConcepto = {}) =>
  buildConceptoOptions(saldosPorConcepto)[0]?.value;

/**
 * Conceptos que ofrece el formulario de CORREGIR un pago: ambos, salvo en curso
 * externo (solo matrícula). Si el pago ya era CURSO (histórico) se conserva para
 * poder mostrarlo.
 */
export const conceptosParaEditarPago = (inscripcion, pago) =>
  CONCEPTO_PAGO_OPTIONS.filter(
    (o) =>
      !inscripcion?.pagoCursoExterno ||
      o.value === CONCEPTO_PAGO.MATRICULA ||
      o.value === pago?.concepto,
  );

/**
 * Saldo disponible por concepto al corregir un pago: el saldo del concepto
 * descontando el propio pago (se le suma su monto al concepto que ya tiene).
 */
export const saldosParaEditarPago = (inscripcion, pago) => {
  const base = {
    [CONCEPTO_PAGO.MATRICULA]: Number(inscripcion?.saldoMatricula) || 0,
    [CONCEPTO_PAGO.CURSO]: Number(inscripcion?.saldoCurso) || 0,
  };
  if (pago?.concepto in base) base[pago.concepto] += Number(pago.monto) || 0;
  return base;
};

/**
 * ¿Se puede corregir o anular este pago? No si está anulado ni si la inscripción
 * está RETIRADA/ANULADA.
 * @returns {{permitido: boolean, motivo: string|null}} `motivo` = tooltip de la acción deshabilitada
 */
export const evaluarAccionPago = (inscripcion, pago) => {
  if (pago?.anulado) return { permitido: false, motivo: 'El pago está anulado' };
  if (!ESTADOS_INSCRIPCION_CAP_VIGENTES.includes(inscripcion?.estado)) {
    return { permitido: false, motivo: 'La inscripción está retirada o anulada' };
  }
  return { permitido: true, motivo: null };
};

/** Total de pagos vigentes (no anulados), para el encabezado del historial. */
export const contarPagosVigentes = (pagos = []) => pagos.filter((p) => !p.anulado).length;
