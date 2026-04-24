/**
 * PUT /api/v1/pagos-aportes/cuotas/:id
 */
export class UpdatePaymentInstallmentController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/UpdatePaymentInstallmentUseCase.js').UpdatePaymentInstallmentUseCase} params.updatePaymentInstallmentUseCase
   * @param {Object} params.logger
   * @param {import('../../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} params.responseFormatter
   */
  constructor({ updatePaymentInstallmentUseCase, logger, responseFormatter }) {
    this.updatePaymentInstallmentUseCase = updatePaymentInstallmentUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const payload = {
        amount: body.amount,
        payment_method_id: body.payment_method_id,
        payment_account_id: body.payment_account_id ?? null,
        payment_date: body.payment_date,
        transaction_number: body.transaction_number ?? null,
        codigo_comprobante: body.codigo_comprobante ?? null,
        descripcion: body.descripcion ?? null,
      };
      const data = await this.updatePaymentInstallmentUseCase.execute(id, payload);
      return this.responseFormatter.updated(res, { cuota: data }, 'cuota de pago', id, req);
    } catch (err) {
      next(err);
    }
  }
}
