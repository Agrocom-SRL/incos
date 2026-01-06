/**
 * GET /api/v1/carreras
 * Controller para listar carreras con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar carreras
 * - Delegar lógica de negocio a ListCarrerasUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/carreras?page=1&limit=50&search=informatica
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por código, nombre o descripción (opcional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar carreras
 * - Dependency Inversion: Depende de ListCarrerasUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListCarrerasController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListCarrerasUseCase} params.listCarrerasUseCase - Caso de uso para listar carreras
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listCarrerasUseCase, logger, responseFormatter }) {
    super({
      useCase: listCarrerasUseCase,
      logger,
      responseFormatter,
      resourceName: 'carreras',
      dataFieldName: 'carreras',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos (ej: activo, codigo),
  // podemos sobrescribir buildFilters() aquí:
  //
  // buildFilters(query) {
  //   const filters = super.buildFilters(query);
  //   if (query.activo !== undefined) {
  //     filters.activo = query.activo === 'true';
  //   }
  //   return filters;
  // }
}

