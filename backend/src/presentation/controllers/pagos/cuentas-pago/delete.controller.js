import { BaseDeleteController } from '../../base/BaseDeleteController.js';

/**
 * DELETE /api/v1/cuentas-pago/:id
 * Elimina (soft-delete) una cuenta de pago.
 *
 * Permiso: finanzas.configuracion.pago (ELIMINAR).
 */
export class DeleteCuentaPagoController extends BaseDeleteController {
  constructor({ deletePaymentAccountUseCase, logger, responseFormatter }) {
    super({
      useCase: deletePaymentAccountUseCase,
      logger,
      responseFormatter,
      resourceName: 'cuenta de pago',
    });
  }
}
