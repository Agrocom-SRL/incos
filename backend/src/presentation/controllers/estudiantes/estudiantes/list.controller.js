/**
 * GET /api/v1/estudiantes
 * Controller para listar estudiantes con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar estudiantes
 * - Agregar filtros específicos (estado, sort) a los filtros comunes
 * - Delegar lógica de negocio a ListStudentsUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/estudiantes?page=1&limit=50&search=juan&estado=REGULAR&sort=codigoEstudiante:ASC
 * 
 * Query Parameters:
 * - page: Número de página (default: 1) - manejado por BaseListController y ListRequestDTO
 * - limit: Cantidad de resultados por página (default: 50, max: 100) - manejado por BaseListController y ListRequestDTO
 * - search: Término de búsqueda general (opcional) - manejado por BaseListController y ListRequestDTO
 * - estado: Estado académico del estudiante (opcional: REGULAR, IRREGULAR, EGRESADO, RETIRADO) - específico de estudiantes
 * - sort: Ordenamiento (opcional, ej: "codigoEstudiante:ASC") - específico de estudiantes
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar estudiantes
 * - Dependency Inversion: Depende de ListStudentsUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Usa DTOs genéricos de Application Layer (ListRequestDTO) para normalización común
 * - Depende de Application Layer (Use Cases inyectados, DTOs importados directamente)
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListStudentsController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListStudentsUseCase} params.listStudentsUseCase - Caso de uso para listar estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listStudentsUseCase, logger, responseFormatter }) {
    super({
      useCase: listStudentsUseCase,
      logger,
      responseFormatter,
      resourceName: 'estudiantes',
      dataFieldName: 'students',
    });
  }

  /**
   * Construye los filtros específicos para la búsqueda de estudiantes
   * Agrega filtros específicos (estado, sort) a los filtros comunes del base controller
   * 
   * @param {Object} query - Query parameters de la request
   * @param {Object} baseFilters - Filtros base ya extraídos por el DTO (search, etc.)
   * @returns {Object} Objeto con filtros específicos adicionales
   */
  buildFilters(query, baseFilters = {}) {
    const specificFilters = {};
    
    // Agregar filtros específicos de estudiantes
    if (query.estado && typeof query.estado === 'string') {
      specificFilters.estado = query.estado.trim().toUpperCase();
    }
    
    if (query.sort && typeof query.sort === 'string') {
      specificFilters.sort = query.sort.trim();
    }
    
    return specificFilters;
  }
}
