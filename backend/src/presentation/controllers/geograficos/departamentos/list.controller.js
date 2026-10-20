/**
 * GET /api/v1/departamentos
 * Controller para listar departamentos con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar departamentos
 * - Delegar lógica de negocio a ListDepartamentosUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/departamentos?page=1&limit=50&search=santa
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar departamentos
 * - Dependency Inversion: Depende de ListDepartamentosUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListDepartamentosController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListDepartamentosUseCase} params.listDepartamentosUseCase - Caso de uso para listar departamentos
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listDepartamentosUseCase, logger, responseFormatter }) {
    super({
      useCase: listDepartamentosUseCase,
      logger,
      responseFormatter,
      resourceName: 'departamentos',
      dataFieldName: 'departamentos',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos (ej: countryId),
  // podemos sobrescribir buildFilters() aquí:
  //
  // buildFilters(query) {
  //   const filters = super.buildFilters(query);
  //   if (query.countryId) {
  //     filters.countryId = query.countryId;
  //   }
  //   return filters;
  // }
}
