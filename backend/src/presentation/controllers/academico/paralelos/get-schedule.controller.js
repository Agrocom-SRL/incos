/**
 * GET /api/v1/paralelos/:id/schedule
 * Controller para obtener los horarios completos de un paralelo
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para obtener horarios de un paralelo
 * - Validar el ID del paralelo
 * - Delegar lógica de negocio a GetParaleloHorariosUseCase (TODO: implementar)
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/paralelos/:id/schedule
 * 
 * Path Parameters:
 * - id: ID del paralelo (número entero mayor a 0)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     paralelo: { ... },
 *     horario: [ ... ]
 *   },
 *   message: "Horarios del paralelo obtenidos correctamente"
 * }
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para obtener horarios
 * - Dependency Inversion: Depende de GetParaleloHorariosUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseGetController } from '../../base/BaseGetController.js';

export class GetParaleloScheduleController extends BaseGetController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GetParaleloHorariosUseCase} params.getParaleloHorariosUseCase - Caso de uso para obtener horarios (TODO: implementar)
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ getParaleloHorariosUseCase, logger, responseFormatter }) {
    super({
      useCase: getParaleloHorariosUseCase,
      logger,
      responseFormatter,
      resourceName: 'horarios del paralelo',
      dataFieldName: 'schedule', // El use case retornará { paralelo, horario } que se envuelve en 'schedule'
    });
  }
}
