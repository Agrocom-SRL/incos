/**
 * GET /api/v1/estudiantes
 * Controller para listar estudiantes con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar estudiantes
 * - Delegar lógica de negocio a ListStudentsUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/estudiantes?page=1&limit=50&search=juan&estado=REGULAR&sort=codigoEstudiante:ASC
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por código, nombre, CI, email o celular (opcional)
 * - estado: Estado académico del estudiante (opcional)
 * - sort: Ordenamiento (opcional, ej: "codigoEstudiante:ASC")
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar estudiantes
 * - Dependency Inversion: Depende de ListStudentsUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListStudentsController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListStudentsUseCase} params.listStudentsUseCase - Caso de uso para listar estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ listStudentsUseCase, logger }) {
    super({
      useCase: listStudentsUseCase,
      logger,
      resourceName: 'estudiantes',
      dataFieldName: 'students',
    });
  }

  /**
   * Construye los filtros para la búsqueda de estudiantes
   * Sobrescribe el método base para agregar filtros específicos (estado, sort)
   * @param {Object} query - Query parameters de la request
   * @returns {Object} Objeto con filtros para el use case
   */
  buildFilters(query) {
    const filters = super.buildFilters(query);
    
    // Filtro específico: estado académico
    if (query.estado) {
      filters.estado = query.estado;
    }
    
    // Filtro específico: ordenamiento
    if (query.sort) {
      filters.sort = query.sort;
    }
    
    return filters;
  }
}
