/**
 * DELETE /api/v1/pagos-aportes/:id
 * Controller para eliminar un pago de aporte
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP DELETE para eliminar un pago
 * - Delegar lógica de negocio a DeletePaymentAporteUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * DELETE /api/v1/pagos-aportes/:id
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para eliminar pagos
 * - Dependency Inversion: Depende de DeletePaymentAporteUseCase (abstracción)
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseDeleteController } from '../../base/BaseDeleteController.js';

export class DeletePaymentAporteController extends BaseDeleteController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {DeletePaymentAporteUseCase} params.deletePaymentAporteUseCase - Caso de uso para eliminar pago
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ deletePaymentAporteUseCase, logger, responseFormatter }) {
    super({
      useCase: deletePaymentAporteUseCase,
      logger,
      responseFormatter,
      resourceName: 'pago de aporte',
    });
  }
}
