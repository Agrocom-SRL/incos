/**
 * GET /api/v1/inscripciones
 * Controller para listar inscripciones con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar inscripciones
 * - Delegar lógica de negocio a ListEnrollmentsUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/inscripciones?page=1&limit=50&search=texto&sort=id:ASC
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50, max: 100)
 * - search: Término de búsqueda general (opcional)
 * - sort: Ordenamiento (opcional, formato: "campo:DIRECCION")
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar inscripciones
 * - Dependency Inversion: Depende de ListEnrollmentsUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Usa DTOs genéricos de Application Layer (ListRequestDTO) para normalización común
 * - Depende de Application Layer (Use Cases inyectados, DTOs importados directamente)
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListEnrollmentsController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListEnrollmentsUseCase} params.listEnrollmentsUseCase - Caso de uso para listar inscripciones
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listEnrollmentsUseCase, logger, responseFormatter }) {
    super({
      useCase: listEnrollmentsUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripciones',
      dataFieldName: 'enrollments',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search) y el ordenamiento genérico (sort)
  // Si en el futuro necesitamos filtros específicos para inscripciones,
  // podemos sobrescribir buildFilters() aquí
}
