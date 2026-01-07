/**
 * Controlador base para operaciones de obtención por ID
 * 
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de obtención por ID
 * 
 * Responsabilidades:
 * - Extraer y validar el ID de los parámetros de ruta
 * - Ejecutar el caso de uso correspondiente
 * - Formatear respuesta JSON estandarizada
 * - Manejar errores de manera consistente
 * 
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de obtención por ID
 * - Template Method: Define el algoritmo común
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja la comunicación HTTP (request/response)
 * - Depende de Use Cases (Application Layer) a través de abstracción
 * 
 * @abstract
 */
export class BaseGetController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(id))
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
   * Maneja la petición HTTP GET para obtener un recurso por ID
   * 
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer ID del recurso (ya validado por idValidator en la ruta)
      const id = parseInt(req.params.id, 10);

      // 2. Logging de la petición
      this.logger.info(`Request de obtención de ${this.resourceName} por ID`, {
        id,
        method: req.method,
        path: req.path,
      });

      // 3. Ejecutar el caso de uso
      const result = await this.useCase.execute(id);

      // 4. Formatear respuesta exitosa
      // El result ya contiene la estructura completa (student, guardians, etc.)
      // Lo envuelvemos en un objeto con el nombre del campo si es necesario
      const responseData = this.dataFieldName ? { [this.dataFieldName]: result } : result;
      
      return this.responseFormatter.retrieved(res, responseData, this.resourceName, id, req);
    } catch (error) {
      // 5. Manejo de errores consistente
      this.logger.error(`Error al obtener ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });

      // Los errores se manejan en el middleware de errores
      // NotFoundError, ValidationError, etc. serán formateados correctamente
      return next(error);
    }
  }
}

