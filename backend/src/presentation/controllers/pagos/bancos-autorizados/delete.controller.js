import { BaseDeleteController } from '../../base/BaseDeleteController.js';

/**
 * DELETE /api/v1/bancos-autorizados/:id
 * Elimina (soft-delete) un banco autorizado.
 *
 * Permiso: finanzas.configuracion.pago (ELIMINAR).
 */
export class DeleteBancoAutorizadoController extends BaseDeleteController {
  constructor({ deleteAuthorizedBankUseCase, logger, responseFormatter }) {
    super({
      useCase: deleteAuthorizedBankUseCase,
      logger,
      responseFormatter,
      resourceName: 'banco autorizado',
    });
  }
}
