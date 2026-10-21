/**
 * GET /api/v1/documentacion
 * Controller para listar tipos de documentación con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar tipos de documentación
 * - Delegar lógica de negocio a ListDocumentacionUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/documentacion?page=1&limit=50&search=ci
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre o descripción (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar tipos de documentación
 * - Dependency Inversion: Depende de ListDocumentacionUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListDocumentacionController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListDocumentacionUseCase} params.listDocumentacionUseCase - Caso de uso para listar tipos de documentación
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listDocumentacionUseCase, logger, responseFormatter }) {
    super({
      useCase: listDocumentacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipos de documentación',
      dataFieldName: 'documentacion',
    });
  }
}
