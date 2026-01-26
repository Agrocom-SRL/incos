/**
 * GET /api/v1/pagos-aportes/:id/recibo
 * Controller para generar u obtener el recibo de pago de un aporte académico
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para generar/obtener el recibo de pago
 * - Delegar lógica común a BaseDocumentController
 * - Configurar nombre del recurso y campo de respuesta
 * 
 * Endpoint:
 * GET /api/v1/pagos-aportes/:id/recibo
 * 
 * Path Parameters:
 * - id: ID del pago (número entero mayor a 0)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     filePath: "/uploads/recibos/2026/pago_1234567_000001.pdf",
 *     fileName: "pago_1234567_000001.pdf",
 *     absolutePath: "/path/to/file.pdf"
 *   },
 *   message: "Recibo de pago generado correctamente"
 * }
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la configuración específica del recibo
 * - Dependency Inversion: Depende de GenerateReciboPagoUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseDocumentController } from '../../base/BaseDocumentController.js';

export class GenerateReciboPagoController extends BaseDocumentController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GenerateReciboPagoUseCase} params.generateReciboPagoUseCase - Caso de uso para generar/obtener recibo
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
   */
  constructor({ generateReciboPagoUseCase, logger, responseFormatter }) {
    super({
      useCase: generateReciboPagoUseCase,
      logger,
      responseFormatter,
      resourceName: 'recibo de pago',
    });
  }

  // No es necesario sobrescribir handle()
  // El base controller maneja toda la lógica común
}
