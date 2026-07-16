import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IPagoCapacitacionRepository
 *
 * Pagos de inscripción a capacitaciones (tabla `capacitacion_pagos`, módulo
 * CAP). Tabla propia: NO extiende `pago_cuotas`/`compromisos_pago` (acoplados
 * a estudiante+gestión); reutiliza solo los catálogos `metodos_pago` y
 * `cuentas_pago` por FK de lectura.
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository. `numero_recibo` se genera en
 * lógica de negocio (ID a 6 dígitos, mismo patrón que pagos de aportes).
 */
export class IPagoCapacitacionRepository extends IRepository {
  /**
   * Suma de montos de pagos vigentes (activo, no eliminados) de una inscripción.
   *
   * @param {number} capacitacionInscritoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<number>} Total pagado (0 si no hay pagos)
   */
  async sumMontoByInscripcionId(_capacitacionInscritoId, _options = {}) {
    throw new Error('Method sumMontoByInscripcionId() must be implemented');
  }

  /**
   * Historial de pagos de una inscripción con nombre del método de pago y
   * datos mínimos de la cuenta (filas crudas snake_case, orden cronológico).
   *
   * @param {number} capacitacionInscritoId
   * @returns {Promise<Array<Object>>}
   */
  async findDetalleByInscripcionId(_capacitacionInscritoId) {
    throw new Error('Method findDetalleByInscripcionId() must be implemented');
  }
}
