/**
 * Use Case: DeletePaymentAporteUseCase
 * 
 * Single Responsibility: Eliminar un pago de aporte por ID (soft delete)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación de un pago
 * - Depende de: ContributionPaymentRepository (Domain/Infrastructure)
 * 
 * Funcionalidades:
 * - Valida que el pago exista
 * - Ejecuta soft delete del pago
 * - Registra la operación en logs
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';

export class DeletePaymentAporteUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {ContributionPaymentRepository} dependencies.contributionPaymentRepository - Repositorio de pagos
   * @param {ILogger} dependencies.logger - Logger para registro de eventos
   */
  constructor({ contributionPaymentRepository, logger }) {
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta la eliminación del pago
   * 
   * @param {number} paymentId - ID del pago a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si el pago no existe
   */
  async execute(paymentId) {
    try {
      this.logger.info('[Pagos] Iniciando eliminación de pago', { paymentId });

      // Verificar que el pago existe
      const payment = await this.contributionPaymentRepository.findById(paymentId);
      
      if (!payment) {
        throw new NotFoundError(`Pago con ID ${paymentId} no encontrado`);
      }

      // Ejecutar eliminación (soft delete)
      const deleted = await this.contributionPaymentRepository.delete(paymentId);

      if (!deleted) {
        throw new NotFoundError(`No se pudo eliminar el pago con ID ${paymentId}`);
      }

      this.logger.info('[Pagos] Pago eliminado exitosamente', {
        paymentId,
        studentId: payment.studentId,
      });
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar pago', {
        paymentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
