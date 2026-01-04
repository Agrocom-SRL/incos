/**
 * GET /api/v1/paises
 * Controller para listar países con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar países
 * - Delegar lógica de negocio a ListPaisesUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/paises?page=1&limit=50&search=bolivia
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre o código ISO (opcional)
 * 
 * Respuesta exitosa (200):
 * {
 *   success: true,
 *   data: [Country[]],
 *   message: "Listado de países obtenido correctamente",
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   },
 *   meta: {
 *     timestamp: string (ISO 8601)
 *   }
 * }
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar países
 * - Dependency Inversion: Depende de ListPaisesUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListPaisesController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListPaisesUseCase} params.listPaisesUseCase - Caso de uso para listar países
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ listPaisesUseCase, logger }) {
    super({
      useCase: listPaisesUseCase,
      logger,
      resourceName: 'países',
      dataFieldName: 'paises',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos (ej: codigoIso, continente),
  // podemos sobrescribir buildFilters() aquí:
  //
  // buildFilters(query) {
  //   const filters = super.buildFilters(query);
  //   if (query.codigoIso) {
  //     filters.codigoIso = query.codigoIso;
  //   }
  //   return filters;
  // }
}

