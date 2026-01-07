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
 * GET /api/v1/estudiantes?page=1&limit=50&search=juan&sort=codigoEstudiante:ASC
 * 
 * Query Parameters:
 * - page: Número de página (default: 1) - manejado por BaseListController y ListRequestDTO
 * - limit: Cantidad de resultados por página (default: 50, max: 100) - manejado por BaseListController y ListRequestDTO
 * - search: Término de búsqueda general (opcional) - manejado por BaseListController y ListRequestDTO
 * - sort: Ordenamiento (opcional, formato: "campo:DIRECCION") - manejado genéricamente por BaseListController
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

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search) y el ordenamiento genérico (sort)
  // Si en el futuro necesitamos filtros específicos para estudiantes,
  // podemos sobrescribir buildFilters() aquí
}
