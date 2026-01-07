/**
 * Controlador base para operaciones de listado
 * 
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de listado (países, departamentos, idiomas, etc.)
 * 
 * Responsabilidades:
 * - Extraer y normalizar parámetros de query usando ListRequestDTO
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
 * - Usa DTOs de Application Layer para transformar datos
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
 *   buildFilters(query, baseFilters) {
 *     const specificFilters = {};
 *     if (query.codigoIso) {
 *       specificFilters.codigoIso = query.codigoIso;
 *     }
 *     return specificFilters; // Solo retorna filtros específicos, los base ya están incluidos
 *   }
 * }
 */
import { ListRequestDTO } from '../../../application/dtos/common/index.js';

export class BaseListController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(filters, page, limit))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {Object} params.responseFormatter - Formatter de respuestas exitosas (inyectado)
   * @param {string} params.resourceName - Nombre del recurso en español (para logs y mensajes)
   * @param {string} params.dataFieldName - Nombre del campo en la respuesta del use case (ej: 'paises', 'departamentos')
   */
  constructor({ useCase, logger, responseFormatter, resourceName, dataFieldName }) {
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

    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }

    this.useCase = useCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.resourceName = resourceName;
    this.dataFieldName = dataFieldName;
  }

  /**
   * Construye los filtros específicos adicionales a partir de los query parameters
   * 
   * Método template: Puede ser sobrescrito por subclases para agregar filtros específicos
   * 
   * NOTA: Los filtros comunes (search) ya fueron extraídos por el DTO en handle().
   * Este método solo debe agregar filtros específicos del módulo.
   * 
   * @param {Object} query - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por el DTO (search, etc.)
   * @returns {Object} Objeto con filtros específicos adicionales
   */
  buildFilters(query, baseFilters = {}) {
    // Por defecto, no agrega filtros específicos
    // Las subclases pueden sobrescribir para agregar filtros específicos
    return {};
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
      // 1. Usar el DTO genérico UNA SOLA VEZ para normalizar query parameters
      // Los query params ya fueron validados por listValidator en la ruta
      const { filters: baseFilters, page, limit } = ListRequestDTO.fromQuery(req.query);

      // 2. Construir filtros específicos adicionales (si buildFilters fue sobrescrito)
      const specificFilters = this.buildFilters(req.query, baseFilters);
      
      // Combinar filtros base con filtros específicos
      const combinedFilters = { ...baseFilters, ...specificFilters };

      // 3. Logging de la petición
      this.logger.info(`Request de listado de ${this.resourceName}`, {
        page,
        limit,
        filters: combinedFilters,
      });

      // 4. Ejecutar el caso de uso
      const result = await this.useCase.execute(combinedFilters, page, limit);

      // 5. Formatear y enviar respuesta JSON estandarizada usando el servicio inyectado
      return this.responseFormatter.list(
        res,
        result[this.dataFieldName] || [],
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        this.resourceName,
        req
      );
    } catch (error) {
      // 6. Manejo de errores consistente
      this.logger.error(`Error al listar ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
      });

      // Los errores se manejan en el middleware de errores
      // NotFoundError, ValidationError, etc. serán formateados correctamente
      return next(error);
    }
  }
}

