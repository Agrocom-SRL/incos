/**
 * GET /api/v1/tipos-parentesco
 * Controller para listar tipos de parentesco con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar tipos de parentesco
 * - Delegar lógica de negocio a ListTiposParentescoUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/tipos-parentesco?page=1&limit=50&search=padre
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por nombre (opcional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar tipos de parentesco
 * - Dependency Inversion: Depende de ListTiposParentescoUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListTiposParentescoController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListTiposParentescoUseCase} params.listTiposParentescoUseCase - Caso de uso para listar tipos de parentesco
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ listTiposParentescoUseCase, logger }) {
    super({
      useCase: listTiposParentescoUseCase,
      logger,
      resourceName: 'tipos de parentesco',
      dataFieldName: 'tiposParentesco',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja la búsqueda básica (search)
  // Si en el futuro necesitamos filtros específicos,
  // podemos sobrescribir buildFilters() aquí
}

