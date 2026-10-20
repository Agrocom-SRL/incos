/**
 * GET /api/v1/idiomas
 * Controller para listar idiomas con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar idiomas
 * - Delegar lógica de negocio a ListIdiomasUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/idiomas?page=1&limit=50&search=espanol
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar idiomas
 * - Dependency Inversion: Depende de ListIdiomasUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListIdiomasController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListIdiomasUseCase} params.listIdiomasUseCase - Caso de uso para listar idiomas
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listIdiomasUseCase, logger, responseFormatter }) {
    super({
      useCase: listIdiomasUseCase,
      logger,
      responseFormatter,
      resourceName: 'idiomas',
      dataFieldName: 'idiomas',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos,
  // podemos sobrescribir buildFilters() aquí
}
