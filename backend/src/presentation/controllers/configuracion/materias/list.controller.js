/**
 * GET /api/v1/materias
 * Controller para listar materias con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar materias
 * - Delegar lógica de negocio a ListMateriasUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/materias?page=1&limit=50&search=matematica
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por código, nombre, nombre corto o descripción (opcional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar materias
 * - Dependency Inversion: Depende de ListMateriasUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListMateriasController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListMateriasUseCase} params.listMateriasUseCase - Caso de uso para listar materias
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ listMateriasUseCase, logger }) {
    super({
      useCase: listMateriasUseCase,
      logger,
      resourceName: 'materias',
      dataFieldName: 'materias',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos (ej: tipo, activo),
  // podemos sobrescribir buildFilters() aquí:
  //
  // buildFilters(query) {
  //   const filters = super.buildFilters(query);
  //   if (query.tipo) {
  //     filters.tipo = query.tipo;
  //   }
  //   return filters;
  // }
}

