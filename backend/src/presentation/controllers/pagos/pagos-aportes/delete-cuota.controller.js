import { BaseDeleteController } from '../../base/BaseDeleteController.js';

/**
 * DELETE /api/v1/pagos-aportes/cuotas/:id
 * Elimina (soft) una cuota; recalcula estado de la cabecera.
 */
export class DeletePaymentInstallmentController extends BaseDeleteController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/DeletePaymentInstallmentUseCase.js').DeletePaymentInstallmentUseCase} params.deletePaymentInstallmentUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ deletePaymentInstallmentUseCase, logger, responseFormatter }) {
    super({
      useCase: deletePaymentInstallmentUseCase,
      logger,
      responseFormatter,
      resourceName: 'cuota de pago',
    });
  }
}
