/**
 * GET /api/v1/gestiones
 * Controller para listar gestiones académicas con filtros y paginación
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar gestiones
 * - Delegar lógica de negocio a ListGestionesUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/gestiones?page=1&limit=50&search=2025
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda por código, nombre o año (opcional)
 * - vigente: Filtrar por vigencia (0 = no vigentes, 1 = vigentes). Ej: ?vigente=0
 * - filtros: JSON con filtros (ej: filtros={"vigente":false,"active":true})
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar gestiones
 * - Dependency Inversion: Depende de ListGestionesUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */
import { BaseListController } from '../../base/BaseListController.js';

export class ListGestionesController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListGestionesUseCase} params.listGestionesUseCase - Caso de uso para listar gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listGestionesUseCase, logger, responseFormatter }) {
    super({
      useCase: listGestionesUseCase,
      logger,
      responseFormatter,
      resourceName: 'gestiones',
      dataFieldName: 'gestiones',
    });
  }

  /**
   * Construye filtros específicos para gestiones
   * Soporta filtros adicionales como 'active' y 'vigente'
   */
  buildFilters(query) {
    const filters = super.buildFilters(query);
    
    // Si se proporciona filtros en el query, parsearlos
    if (query.filtros) {
      try {
        const parsedFilters = typeof query.filtros === 'string' 
          ? JSON.parse(query.filtros) 
          : query.filtros;
        
        // Mapear filtros del frontend a filtros del dominio
        if (parsedFilters.active !== undefined) {
          filters.isActive = parsedFilters.active;
        }
        if (parsedFilters.vigente !== undefined) {
          filters.vigente = parsedFilters.vigente;
        }
        if (parsedFilters.year !== undefined) {
          filters.year = parsedFilters.year;
        }
        if (parsedFilters.type !== undefined) {
          filters.type = parsedFilters.type;
        }
      } catch (error) {
        // Si hay error al parsear filtros, ignorarlos y continuar con búsqueda básica
        this.logger.warn('[Gestiones] Error al parsear filtros', { error: error.message });
      }
    }
    
    return filters;
  }
}
