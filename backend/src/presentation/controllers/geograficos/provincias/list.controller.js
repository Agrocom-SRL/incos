/**
 * GET /api/v1/provincias
 * Controller para listar provincias con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar provincias
 * - Delegar lógica de negocio a ListProvinciasUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/provincias?page=1&limit=50&search=valle
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre (opcional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar provincias
 * - Dependency Inversion: Depende de ListProvinciasUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListProvinciasController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListProvinciasUseCase} params.listProvinciasUseCase - Caso de uso para listar provincias
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listProvinciasUseCase, logger, responseFormatter }) {
    super({
      useCase: listProvinciasUseCase,
      logger,
      responseFormatter,
      resourceName: 'provincias',
      dataFieldName: 'provincias',
    });
  }

  /**
   * Sobrescribe buildFilters para agregar filtro por departamento
   * @param {Object} query - Query parameters de Express
   * @returns {Object} Filtros para el use case
   */
  buildFilters(query) {
    const filters = super.buildFilters(query);
    
    // Filtrar provincias por departamento si se proporciona departamentoId
    if (query.departamentoId) {
      filters.departmentId = Number(query.departamentoId);
    }
    
    return filters;
  }
}

