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
      const id = parseInt(req.params.id, 10);

      // Validar que el ID sea un número válido
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: `ID inválido: ${req.params.id}. Debe ser un número entero mayor a 0.`,
          errors: [
            {
              field: 'id',
              message: 'El ID debe ser un número entero mayor a 0',
            },
          ],
        });
      }

      this.logger.info(`Request de obtención de ${this.resourceName} por ID`, {
        id,
        method: req.method,
        path: req.path,
      });

      // Ejecutar el caso de uso
      const result = await this.useCase.execute(id);

      // Formatear respuesta exitosa
      return this.responseFormatter.success(res, {
        [this.dataFieldName]: result,
        message: `${this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1)} obtenido correctamente`,
      });
    } catch (error) {
      // Si el error es "No se encontró", retornar 404
      if (error.message && error.message.includes('No se encontró')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      // Para otros errores, pasar al middleware de manejo de errores
      return next(error);
    }
  }
}

