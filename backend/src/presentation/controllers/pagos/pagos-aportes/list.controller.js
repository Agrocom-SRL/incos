/**
 * GET /api/v1/pagos-aportes
 * Controller para listar pagos de aportes con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar pagos de aportes
 * - Delegar lógica de negocio a ListPagosAportesUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/pagos-aportes?page=1&limit=50&search=texto&sort=id:ASC
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50, max: 100)
 * - search: Término de búsqueda general (opcional)
 * - sort: Ordenamiento (opcional, formato: "campo:DIRECCION")
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar pagos de aportes
 * - Dependency Inversion: Depende de ListPagosAportesUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Usa DTOs genéricos de Application Layer (ListRequestDTO) para normalización común
 * - Depende de Application Layer (Use Cases inyectados, DTOs importados directamente)
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListPagosAportesController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListPagosAportesUseCase} params.listPagosAportesUseCase - Caso de uso para listar pagos de aportes
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listPagosAportesUseCase, logger, responseFormatter }) {
    super({
      useCase: listPagosAportesUseCase,
      logger,
      responseFormatter,
      resourceName: 'pagos de aportes',
      dataFieldName: 'pagos',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search) y el ordenamiento genérico (sort)
  // Si en el futuro necesitamos filtros específicos para pagos de aportes,
  // podemos sobrescribir buildFilters() aquí
}
