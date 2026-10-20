/**
 * Controlador base para operaciones de creación
 *
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de creación (países, departamentos, estudiantes, etc.)
 *
 * Responsabilidades:
 * - Extraer y validar datos del body de la petición
 * - Preparar datos para el caso de uso (opcional, puede ser sobrescrito)
 * - Ejecutar el caso de uso correspondiente
 * - Formatear respuesta JSON estandarizada usando ResponseFormatter
 * - Manejar errores de manera consistente
 *
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de creación
 * - Template Method: Define el algoritmo común, delega preparación de datos a subclases
 * - Open/Closed: Abierto para extensión (preparación de datos específicos), cerrado para modificación
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja la comunicación HTTP (request/response)
 * - Usa helpers de Presentation Layer para formatear respuestas
 * - Depende de Use Cases (Application Layer) a través de abstracción
 *
 * @abstract
 * @example
 * class CreatePaisController extends BaseCreateController {
 *   constructor({ createPaisUseCase, logger }) {
 *     super({
 *       useCase: createPaisUseCase,
 *       logger,
 *       resourceName: 'país',
 *       dataFieldName: 'pais'
 *     });
 *   }
 *
 *   // Opcional: Sobrescribir para preparar datos específicos antes de enviar al use case
 *   prepareData(body) {
 *     const data = super.prepareData(body);
 *     // Agregar transformaciones específicas si es necesario
 *     return data;
 *   }
 * }
 */
export class BaseCreateController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(data, userId))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {Object} params.responseFormatter - Formatter de respuestas exitosas (inyectado)
   * @param {string} params.resourceName - Nombre del recurso en español (para logs y mensajes)
   * @param {string} params.dataFieldName - Nombre del campo en la respuesta del use case (ej: 'pais', 'estudiante')
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
   * Prepara los datos del body antes de enviarlos al use case
   *
   * Método template: Puede ser sobrescrito por subclases para agregar transformaciones específicas
   *
   * @param {Object} body - Body de la petición HTTP (req.body)
   * @returns {Object} Datos preparados para el use case
   */
  prepareData(body) {
    // Por defecto, retorna el body sin modificar
    // Las subclases pueden sobrescribir para agregar transformaciones
    return body;
  }

  /**
   * Maneja la petición HTTP POST para crear un recurso
   *
   * Template Method: Define el algoritmo común de:
   * 1. Extraer datos del body
   * 2. Preparar datos (delegado a prepareData)
   * 3. Obtener userId del request
   * 4. Ejecutar use case
   * 5. Formatear respuesta
   * 6. Manejar errores
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer datos del body
      const body = req.body || {};

      // 2. Logging de la petición
      this.logger.info(`Request de creación de ${this.resourceName}`, {
        body: this.sanitizeBodyForLogging(body),
      });

      // 3. Preparar datos (puede ser sobrescrito por subclases)
      const preparedData = this.prepareData(body);

      // 4. Ejecutar el caso de uso
      const result = await this.useCase.execute(preparedData);

      // 5. Extraer datos y ID para la respuesta
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || responseData?.resourceId || 'nuevo';

      // 6. Formatear y enviar respuesta JSON estandarizada usando el servicio inyectado
      return this.responseFormatter.created(
        res,
        responseData,
        this.resourceName,
        resourceId,
        req
      );
    } catch (error) {
      // 6. Manejo de errores consistente
      this.logger.error(`Error al crear ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
      });

      // Los errores se manejan en el middleware de errores
      // NotFoundError, ValidationError, etc. serán formateados correctamente
      return next(error);
    }
  }

  /**
   * Sanitiza el body para logging (elimina datos sensibles)
   *
   * @param {Object} body - Body de la petición
   * @returns {Object} Body sanitizado para logging
   */
  sanitizeBodyForLogging(body) {
    // Por defecto, retorna el body sin modificar
    // Las subclases pueden sobrescribir para eliminar campos sensibles
    return body;
  }
}
