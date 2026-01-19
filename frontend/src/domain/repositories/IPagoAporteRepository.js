/**
 * Interfaz del Repositorio de Pagos de Aporte
 * Tabla: pago_aporte
 * 
 * Extiende IBaseRepository con métodos específicos de pagos de aporte
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IPagoAporteRepository extends IBaseRepository {
  /**
   * Registra un nuevo pago de aporte académico
   * POST /v1/pagos-aportes
   * 
   * @param {Object} data - Datos del pago a registrar
   * @param {number} data.student_id - ID del estudiante
   * @param {number} data.payment_method_id - ID del método de pago (1=EFECTIVO, 2=QR, 3=TRANSFERENCIA)
   * @param {number|null} data.payment_account_id - ID de la cuenta de pago (NULL para EFECTIVO, opcional para QR, requerido para TRANSFERENCIA)
   * @param {string} data.payment_date - Fecha del pago (YYYY-MM-DD)
   * @param {string|null} data.transaction_number - Número de transacción (requerido para QR/TRANSFERENCIA, opcional para EFECTIVO)
   * @param {string} data.concept - Concepto del pago
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarPago(data) {
    throw new Error('Method registrarPago must be implemented');
  }
}
