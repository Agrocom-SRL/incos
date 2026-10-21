/**
 * Controlador base para operaciones de búsqueda por texto libre
 *
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de búsqueda
 *
 * Responsabilidades:
 * - Extraer término de búsqueda de query parameters
 * - Ejecutar el caso de uso correspondiente
 * - Formatear respuesta JSON estandarizada
 * - Manejar errores de manera consistente
 *
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de búsqueda
 * - Template Method: Define el algoritmo común
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja la comunicación HTTP (request/response)
 * - Depende de Use Cases (Application Layer) a través de abstracción
 *
 * @abstract
 */
import { NotFoundError } from '../../../domain/errors/AppError.js';

export class BaseSearchController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(searchTerm))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {Object} params.responseFormatter - Formatter de respuestas exitosas (inyectado)
   * @param {string} params.resourceName - Nombre del recurso en español (para logs y mensajes)
   * @param {string} params.dataFieldName - Nombre del campo en la respuesta del use case (ej: 'student', 'career')
   */
  constructor({ useCase, logger, responseFormatter, resourceName, dataFieldName }) {
    if (!useCase) {
      throw new Error('useCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }
    if (!resourceName) {
      throw new Error('resourceName es requerido');
    }
    if (!dataFieldName) {
      throw new Error('dataFieldName es requerido');
    }

    this.useCase = useCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.resourceName = resourceName;
    this.dataFieldName = dataFieldName;
  }

  /**
   * Extrae los parámetros de búsqueda de la petición HTTP
   *
   * @param {Object} req - Request de Express
   * @returns {Object} Objeto con searchTerm y limit
   */
  extractSearchParams(req) {
    const searchTerm = req.query.query || null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    return { searchTerm, limit };
  }

  /**
   * Valida que se hayan encontrado resultados
   *
   * @param {Array} results - Resultados de la búsqueda
   * @throws {NotFoundError} Si no hay resultados
   */
  validateResults(results) {
    if (!results || results.length === 0) {
      throw new NotFoundError(this.resourceName);
    }
  }

  /**
   * Formatea la respuesta según la cantidad de resultados
   * Si hay un solo resultado, retorna el objeto directamente
   * Si hay múltiples, retorna el array
   *
   * @param {Array} results - Resultados de la búsqueda
   * @returns {Object} Datos formateados para la respuesta
   */
  formatSearchResponse(results) {
    const isSingleResult = results.length === 1;
    const data = isSingleResult ? results[0] : results;

    return this.dataFieldName
      ? { [this.dataFieldName]: data }
      : data;
  }

  /**
   * Obtiene el ID del recurso para la respuesta
   * Si hay un solo resultado con ID, lo retorna
   * Si hay múltiples, retorna 'búsqueda'
   *
   * @param {Array} results - Resultados de la búsqueda
   * @returns {string|number} ID del recurso
   */
  getResourceId(results) {
    const isSingleResult = results.length === 1;
    return isSingleResult && results[0].id ? results[0].id : 'búsqueda';
  }

  /**
   * Maneja la petición HTTP GET para buscar un recurso por texto libre
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer parámetros de búsqueda
      const { searchTerm, limit } = this.extractSearchParams(req);

      // 2. Logging de la petición
      this.logger.info(`Request de búsqueda de ${this.resourceName}`, {
        searchTerm,
        limit,
        method: req.method,
        path: req.path,
      });

      // 3. Ejecutar el caso de uso
      const results = await this.useCase.execute(searchTerm, limit);

      // 4. Validar que se encontraron resultados
      this.validateResults(results);

      // 5. Formatear respuesta exitosa
      const responseData = this.formatSearchResponse(results);
      const resourceId = this.getResourceId(results);

      return this.responseFormatter.retrieved(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      // 6. Manejo de errores consistente
      this.logger.error(`Error al buscar ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
        searchTerm: req.query?.query,
        limit: req.query?.limit,
      });

      // Los errores se manejan en el middleware de errores
      // NotFoundError, ValidationError, etc. serán formateados correctamente
      return next(error);
    }
  }
}
