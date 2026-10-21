/**
 * GET /api/v1/discapacidad
 * Controller para listar tipos de discapacidad con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar tipos de discapacidad
 * - Delegar lógica de negocio a ListDiscapacidadUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/discapacidad?page=1&limit=50&search=motriz
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre o descripción (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar tipos de discapacidad
 * - Dependency Inversion: Depende de ListDiscapacidadUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListDiscapacidadController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListDiscapacidadUseCase} params.listDiscapacidadUseCase - Caso de uso para listar tipos de discapacidad
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listDiscapacidadUseCase, logger, responseFormatter }) {
    super({
      useCase: listDiscapacidadUseCase,
      logger,
      responseFormatter,
      resourceName: 'tipos de discapacidad',
      dataFieldName: 'discapacidades',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos,
  // podemos sobrescribir buildFilters() aquí
}
