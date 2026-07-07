import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: DeletePaymentAccountUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Elimina (soft-delete) una cuenta de pago.
 */
export class DeletePaymentAccountUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.paymentAccountRepository - Repositorio de cuentas de pago
   * @param {Object} params.logger
   */
  constructor({ paymentAccountRepository, logger }) {
    this.paymentAccountRepository = paymentAccountRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.paymentAccountRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('cuenta de pago');
    this.logger.info('Cuenta de pago eliminada', { id });
    return true;
  }
}
