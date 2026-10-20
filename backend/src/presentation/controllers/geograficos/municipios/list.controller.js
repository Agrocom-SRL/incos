/**
 * GET /api/v1/municipios
 * Controller para listar municipios con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar municipios
 * - Delegar lógica de negocio a ListMunicipiosUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/municipios?page=1&limit=50&search=cochabamba
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar municipios
 * - Dependency Inversion: Depende de ListMunicipiosUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListMunicipiosController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListMunicipiosUseCase} params.listMunicipiosUseCase - Caso de uso para listar municipios
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listMunicipiosUseCase, logger, responseFormatter }) {
    super({
      useCase: listMunicipiosUseCase,
      logger,
      responseFormatter,
      resourceName: 'municipios',
      dataFieldName: 'municipios',
    });
  }

}
