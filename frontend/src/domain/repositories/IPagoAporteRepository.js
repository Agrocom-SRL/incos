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

  /**
   * Obtiene un pago de aporte por ID con todos sus datos relacionados
   * GET /v1/pagos-aportes/:id
   * 
   * @param {string|number} id - ID del pago
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id) {
    throw new Error('Method obtenerPorId must be implemented');
  }

  /**
   * Elimina un pago de aporte por ID (soft delete)
   * DELETE /v1/pagos-aportes/:id
   * 
   * @param {string|number} id - ID del pago a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    throw new Error('Method eliminar must be implemented');
  }

  /**
   * Actualiza una cuota (pago_cuotas) existente.
   * PUT /v1/pagos-aportes/cuotas/:id
   *
   * @param {string|number} cuotaId
   * @param {Object} payload
   */
  async actualizarCuota(cuotaId, payload) {
    throw new Error('Method actualizarCuota must be implemented');
  }

  /**
   * Elimina una cuota (abono) por id de pago_cuotas (soft delete en servidor).
   * DELETE /v1/pagos-aportes/cuotas/:id
   *
   * @param {string|number} cuotaId
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminarCuota(cuotaId) {
    throw new Error('Method eliminarCuota must be implemented');
  }

  /**
   * Genera u obtiene el recibo de pago de un aporte académico
   * GET /v1/pagos-aportes/:id/recibo
   * 
   * Verifica si el recibo ya existe en documentos_estudiante:
   * - Si existe, retorna la información del archivo existente
   * - Si no existe, genera el recibo y lo guarda en documentos_estudiante
   * 
   * @param {string|number} id - ID del pago
   * @returns {Promise<{success: boolean, data?: {filePath: string, fileName: string, absolutePath: string}, error?: string}>}
   */
  async generarRecibo(id) {
    throw new Error('Method generarRecibo must be implemented');
  }
}
