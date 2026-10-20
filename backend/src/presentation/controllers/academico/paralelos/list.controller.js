/**
 * GET /api/v1/paralelos
 * Controller para listar paralelos con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar paralelos
 * - Delegar lógica de negocio a ListParalelosUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/paralelos?page=1&limit=50&search=PRIMERO&periodo_id=1&carrera_id=1
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre o descripción (opcional)
 * - periodo_id: Filtro por ID de periodo (opcional)
 * - carrera_id: Filtro por ID de carrera (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar paralelos
 * - Dependency Inversion: Depende de ListParalelosUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListParalelosController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListParalelosUseCase} params.listParalelosUseCase - Caso de uso para listar paralelos
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listParalelosUseCase, logger, responseFormatter }) {
    super({
      useCase: listParalelosUseCase,
      logger,
      responseFormatter,
      resourceName: 'paralelos',
      dataFieldName: 'paralelos',
    });
  }
}
