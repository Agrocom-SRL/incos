/**
 * GET /api/v1/becas-descuentos
 * Controller para listar becas y descuentos con filtros y paginación
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar becas y descuentos
 * - Delegar lógica de negocio a ListBecasDescuentosUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/becas-descuentos?page=1&limit=50&search=25
 *
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre, código o descripción (opcional)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar becas y descuentos
 * - Dependency Inversion: Depende de ListBecasDescuentosUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListBecasDescuentosController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListBecasDescuentosUseCase} params.listBecasDescuentosUseCase - Caso de uso para listar becas y descuentos
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listBecasDescuentosUseCase, logger, responseFormatter }) {
    super({
      useCase: listBecasDescuentosUseCase,
      logger,
      responseFormatter,
      resourceName: 'becas y descuentos',
      dataFieldName: 'becasDescuentos',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos (ej: porcentaje, esAutomatica),
  // podemos sobrescribir buildFilters() aquí:
  //
  // buildFilters(query) {
  //   const filters = super.buildFilters(query);
  //   if (query.porcentaje !== undefined) {
  //     filters.percentage = parseFloat(query.porcentaje);
  //   }
  //   if (query.esAutomatica !== undefined) {
  //     filters.isAutomatic = query.esAutomatica === 'true';
  //   }
  //   return filters;
  // }
}
