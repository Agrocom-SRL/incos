/**
 * GET /api/v1/estados-civiles
 * Controller para listar estados civiles con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar estados civiles
 * - Delegar lógica de negocio a ListEstadosCivilesUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/estados-civiles?page=1&limit=50&search=soltero
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre (opcional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar estados civiles
 * - Dependency Inversion: Depende de ListEstadosCivilesUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListEstadosCivilesController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListEstadosCivilesUseCase} params.listEstadosCivilesUseCase - Caso de uso para listar estados civiles
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ listEstadosCivilesUseCase, logger }) {
    super({
      useCase: listEstadosCivilesUseCase,
      logger,
      resourceName: 'estados civiles',
      dataFieldName: 'estadosCiviles',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos,
  // podemos sobrescribir buildFilters() aquí
}

