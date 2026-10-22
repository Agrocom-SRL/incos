/**
 * Validaciones compartidas de un pago de capacitación (alta y corrección).
 *
 * `RegisterPagoCapacitacionUseCase` y `UpdatePagoCapacitacionUseCase` aplican
 * EXACTAMENTE las mismas reglas de concepto, monto, sobrepago por concepto,
 * método y cuenta: viven aquí una sola vez (sin duplicar). Funciones sin estado.
 */

import { NotFoundError, ValidationError } from '../../../../domain/errors/AppError.js';
import {
  CONCEPTOS_PAGO_CAPACITACION,
  CONCEPTOS_PAGO_CAPACITACION_VALUES,
} from '../../../../domain/constants/capacitacion.constants.js';
import { parseFechaISO, parseIdPositivo, parseNumero } from '../../../utils/validacionEntrada.js';
import { aCentavos } from './estadoInscripcion.js';

export const esVacio = (valor) =>
  valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

/**
 * Concepto obligatorio: MATRICULA | CURSO (sin distinguir mayúsculas).
 * @param {*} valor
 * @returns {string}
 */
export function parseConceptoPago(valor) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ValidationError(
      `concepto es requerido (${CONCEPTOS_PAGO_CAPACITACION_VALUES.join(' o ')})`
    );
  }
  const concepto = valor.trim().toUpperCase();
  if (!CONCEPTOS_PAGO_CAPACITACION_VALUES.includes(concepto)) {
    throw new ValidationError(
      `concepto debe ser uno de: ${CONCEPTOS_PAGO_CAPACITACION_VALUES.join(', ')}`
    );
  }
  return concepto;
}

/**
 * Monto > 0 con máximo 2 decimales.
 * @param {*} valor
 * @returns {number}
 */
export function parseMontoPago(valor) {
  const monto = parseNumero(valor, 'monto', { min: 0.01, max: 99999999.99 });
  if (Math.abs(monto * 100 - Math.round(monto * 100)) > 1e-6) {
    throw new ValidationError('monto admite como máximo 2 decimales');
  }
  return monto;
}

/**
 * Fecha del pago (YYYY-MM-DD); vacía → `porDefecto` (hoy si no se indica).
 * @param {*} valor
 * @param {string} [porDefecto]
 * @returns {string}
 */
export function parseFechaPago(valor, porDefecto = new Date().toISOString().slice(0, 10)) {
  return esVacio(valor) ? porDefecto : parseFechaISO(valor, 'fechaPago');
}

/**
 * Un curso con entidad certificadora no admite pagos de concepto CURSO: ese costo
 * se deposita a la entidad y se acredita con un requisito, no con un pago.
 *
 * @param {string} concepto
 * @param {boolean} pagoCursoExterno
 * @throws {ValidationError}
 */
export function validarConceptoPermitido(concepto, pagoCursoExterno) {
  if (pagoCursoExterno && concepto === CONCEPTOS_PAGO_CAPACITACION.CURSO) {
    throw new ValidationError(
      'El costo del curso se deposita a la entidad certificadora y no se registra como pago en el sistema; ' +
        'solo se registra la matrícula. Acredite el depósito entregando el requisito correspondiente de la inscripción'
    );
  }
}

/**
 * El monto no puede superar el saldo pendiente DEL CONCEPTO, calculado contra el
 * SNAPSHOT de la inscripción (no contra el costo actual del curso).
 *
 * @param {Object} params
 * @param {string} params.concepto
 * @param {number} params.monto
 * @param {{montoMatricula?: number, montoObligatorio?: number}} params.inscripcion
 * @param {number} params.pagadoConcepto - Ya pagado del concepto, SIN contar el pago que se corrige
 * @throws {ValidationError}
 */
export function validarMontoDentroDelSaldo({ concepto, monto, inscripcion, pagadoConcepto }) {
  const esMatricula = concepto === CONCEPTOS_PAGO_CAPACITACION.MATRICULA;
  const montoObjetivo = Number(
    (esMatricula ? inscripcion.montoMatricula : inscripcion.montoObligatorio) ?? 0
  );
  const saldoC = Math.max(0, aCentavos(montoObjetivo) - aCentavos(pagadoConcepto));
  if (aCentavos(monto) > saldoC) {
    const nombre = esMatricula ? 'la matrícula' : 'el costo del curso';
    const limite = Number(pagadoConcepto) > 0 ? `el saldo pendiente de ${nombre}` : nombre;
    throw new ValidationError(
      `El monto del pago (Bs. ${monto.toFixed(2)}) no puede superar ${limite} (Bs. ${(saldoC / 100).toFixed(2)})`
    );
  }
}

/**
 * Método de pago (catálogo `metodos_pago`) obligatorio y existente.
 * @param {Object} paymentMethodRepository
 * @param {*} valor
 * @returns {Promise<number>} metodoPagoId
 */
export async function resolverMetodoPago(paymentMethodRepository, valor) {
  if (esVacio(valor)) throw new ValidationError('metodoPagoId es requerido');
  const metodoPagoId = parseIdPositivo(valor, 'metodoPagoId');
  const metodoPago = await paymentMethodRepository.findById(metodoPagoId);
  if (!metodoPago) throw new NotFoundError(`método de pago con ID ${metodoPagoId}`);
  return metodoPagoId;
}

/**
 * Cuenta de pago (catálogo `cuentas_pago`) opcional; si se indica debe existir.
 * @param {Object} paymentAccountRepository
 * @param {*} valor
 * @returns {Promise<number|null>} cuentaPagoId
 */
export async function resolverCuentaPago(paymentAccountRepository, valor) {
  if (esVacio(valor)) return null;
  const cuentaPagoId = parseIdPositivo(valor, 'cuentaPagoId');
  const cuenta = await paymentAccountRepository.findById(cuentaPagoId);
  if (!cuenta) throw new NotFoundError(`cuenta de pago con ID ${cuentaPagoId}`);
  return cuentaPagoId;
}
