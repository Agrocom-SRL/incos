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
      // Edición parcial: solo se reenvían las claves presentes; omitir un campo no lo borra.
      const CAMPOS = [
        'amount', 'payment_method_id', 'payment_account_id', 'payment_date',
        'transaction_number', 'codigo_comprobante', 'descripcion',
      ];
      const payload = Object.fromEntries(CAMPOS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
      const data = await this.updatePaymentInstallmentUseCase.execute(id, payload);
      return this.responseFormatter.updated(res, { cuota: data }, 'cuota de pago', id, req);
    } catch (err) {
      next(err);
    }
  }
}
