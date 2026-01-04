/**
 * Controlador base para operaciones de listado
 * 
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de listado (países, departamentos, idiomas, etc.)
 * 
 * Responsabilidades:
 * - Extraer y validar parámetros de query (page, limit, search)
 * - Construir filtros básicos de búsqueda
 * - Ejecutar el caso de uso correspondiente
 * - Formatear respuesta JSON estandarizada
 * - Manejar errores de manera consistente
 * 
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de listado
 * - Template Method: Define el algoritmo común, delega construcción de filtros específicos a subclases
 * - Open/Closed: Abierto para extensión (filtros específicos), cerrado para modificación
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja la comunicación HTTP (request/response)
 * - Depende de Use Cases (Application Layer) a través de abstracción
 * 
 * @abstract
 * @example
 * class ListPaisesController extends BaseListController {
 *   constructor({ listPaisesUseCase, logger }) {
 *     super({
 *       useCase: listPaisesUseCase,
 *       logger,
 *       resourceName: 'países',
 *       dataFieldName: 'paises'
 *     });
 *   }
 * 
 *   // Opcional: Sobrescribir para agregar filtros específicos
 *   buildFilters(query) {
 *     const filters = super.buildFilters(query);
 *     if (query.codigoIso) {
 *       filters.codigoIso = query.codigoIso;
 *     }
 *     return filters;
 *   }
 * }
 */
export class BaseListController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(filters, page, limit))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {string} params.resourceName - Nombre del recurso en español (para logs y mensajes)
   * @param {string} params.dataFieldName - Nombre del campo en la respuesta del use case (ej: 'paises', 'departamentos')
   */
  constructor({ useCase, logger, resourceName, dataFieldName }) {
    if (!useCase) {
      throw new Error('useCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!resourceName) {
      throw new Error('resourceName es requerido');
    }
    if (!dataFieldName) {
      throw new Error('dataFieldName es requerido');
    }

    this.useCase = useCase;
    this.logger = logger;
    this.resourceName = resourceName;
    this.dataFieldName = dataFieldName;
  }

  /**
   * Construye los filtros básicos a partir de los query parameters
   * 
   * Método template: Puede ser sobrescrito por subclases para agregar filtros específicos
   * 
   * @param {Object} query - Query parameters de Express (req.query)
   * @returns {Object} Objeto de filtros para el use case
   */
  buildFilters(query) {
    const filters = {};
    
    // Filtro de búsqueda general (común a todos los recursos)
    if (query.search) {
      filters.search = query.search;
    }

    return filters;
  }

  /**
   * Maneja la petición HTTP GET para listar recursos
   * 
   * Template Method: Define el algoritmo común de:
   * 1. Extraer y validar parámetros
   * 2. Construir filtros (delegado a buildFilters)
   * 3. Ejecutar use case
   * 4. Formatear respuesta
   * 5. Manejar errores
   * 
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer y validar parámetros de query
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user?.id || req.user?.userId;

      // 2. Logging de la petición
      const filters = this.buildFilters(req.query);
      this.logger.info(`Request de listado de ${this.resourceName}`, {
        page,
        limit,
        filters,
        userId,
      });

      // 3. Validar que el use case esté configurado
      if (!this.useCase) {
        throw new Error(`${this.useCase.constructor.name} no está configurado`);
      }

      // 4. Ejecutar el caso de uso
      const result = await this.useCase.execute(filters, page, limit);

      // 5. Formatear y enviar respuesta JSON estandarizada
      res.status(200).json({
        success: true,
        data: result[this.dataFieldName] || [],
        message: `Listado de ${this.resourceName} obtenido correctamente`,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // 6. Manejo de errores consistente
      this.logger.error(`Error al listar ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

