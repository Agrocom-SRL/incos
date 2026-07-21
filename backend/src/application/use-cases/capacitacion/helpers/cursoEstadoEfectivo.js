/**
 * Helper de dominio: estado EFECTIVO de un curso de capacitación (módulo CAP).
 *
 * `capacitaciones.estado` solo se muta manualmente entre PROPUESTO y ABIERTO
 * (abrir inscripciones) o hacia CANCELADO. La transición ABIERTO → EN_CURSO →
 * CERRADO es automática por FECHA, calculada en caliente (sin cron: el
 * proyecto no tiene ningún mecanismo de scheduler). PROPUESTO y CANCELADO son
 * terminales/manuales, sin recálculo por fecha.
 *
 * Mismo criterio de fecha que
 * `application/use-cases/pagos/helpers/compromisoContract.js`
 * (`todayStr`/`toDateStr`), duplicado aquí para no cruzar dominios
 * pagos → capacitacion.
 *
 * Fuente única de verdad: úsese `resolveEstadoEfectivoCurso` en el mapper, en
 * el guard de inscripción y en los use cases de transición manual — nunca
 * reimplementar este cálculo en otro lugar.
 */

import { ESTADOS_CAPACITACION } from '../../../../domain/constants/capacitacion.constants.js';

/** Fecha de hoy (servidor) normalizada a YYYY-MM-DD. */
export function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Normaliza un valor de fecha (Date|string) a YYYY-MM-DD o null. */
export function toDateStr(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
}

/**
 * Estados de negocio que se recalculan por fecha a partir del estado crudo
 * ABIERTO. PROPUESTO y CANCELADO nunca aparecen aquí (son manuales/terminales).
 */
export const ESTADOS_DERIVADOS_POR_FECHA = [
  ESTADOS_CAPACITACION.ABIERTO,
  ESTADOS_CAPACITACION.EN_CURSO,
  ESTADOS_CAPACITACION.CERRADO,
];

/**
 * Resuelve el estado EFECTIVO de un curso a partir del estado crudo (BD) y
 * sus fechas de inicio/fin.
 *
 * - PROPUESTO / CANCELADO: se devuelven tal cual (terminales/manuales).
 * - ABIERTO: si `hoy > fechaFin` → CERRADO; si `hoy >= fechaInicio` → EN_CURSO;
 *   si no, sigue ABIERTO.
 *
 * @param {string} estadoCrudo - Valor crudo de `capacitaciones.estado`
 * @param {Date|string|null} fechaInicio
 * @param {Date|string|null} fechaFin
 * @param {string} [hoy] - YYYY-MM-DD (por defecto hoy del servidor)
 * @returns {string} Estado efectivo (mismo dominio que ESTADOS_CAPACITACION)
 */
export function resolveEstadoEfectivoCurso(estadoCrudo, fechaInicio, fechaFin, hoy = todayStr()) {
  if (estadoCrudo !== ESTADOS_CAPACITACION.ABIERTO) return estadoCrudo;

  const fin = toDateStr(fechaFin);
  const inicio = toDateStr(fechaInicio);

  if (fin && hoy > fin) return ESTADOS_CAPACITACION.CERRADO;
  if (inicio && hoy >= inicio) return ESTADOS_CAPACITACION.EN_CURSO;
  return ESTADOS_CAPACITACION.ABIERTO;
}
