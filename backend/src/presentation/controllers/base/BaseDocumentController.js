/**
 * Controlador base para operaciones de generación de documentos
 *
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de generación de documentos (acta de compromiso, licencias, becas, etc.)
 *
 * Responsabilidades:
 * - Extraer y validar el ID del recurso desde los parámetros de ruta
 * - Ejecutar el caso de uso correspondiente para generar el documento
 * - Formatear respuesta JSON estandarizada usando ResponseFormatter
 * - Manejar errores de manera consistente
 *
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de generación de documentos
 * - Template Method: Define el algoritmo común, permite personalización en subclases
 * - Open/Closed: Abierto para extensión (opciones personalizadas), cerrado para modificación
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja la comunicación HTTP (request/response)
 * - Usa ResponseFormatter para formatear respuestas exitosas
 * - Depende de Use Cases (Application Layer) a través de abstracción
 *
 * @abstract
 * @example
 * class ActaCompromisoController extends BaseDocumentController {
 *   constructor({ generateActaCompromisoUseCase, logger, responseFormatter }) {
 *     super({
 *       useCase: generateActaCompromisoUseCase,
 *       logger,
 *       responseFormatter,
 *       resourceName: 'acta de compromiso'
 *     });
 *   }
 *
 * }
 */
export class BaseDocumentController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(id, options))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {Object} params.responseFormatter - Formatter de respuestas exitosas (inyectado)
   * @param {string} params.resourceName - Nombre del recurso en español (ej: 'acta de compromiso')
   */
  constructor({ useCase, logger, responseFormatter, resourceName }) {
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

    this.useCase = useCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.resourceName = resourceName;
  }

  /**
   * Maneja la petición HTTP POST para generar un documento
   *
   * Template Method: Define el algoritmo común de:
   * 1. Extraer y validar ID del recurso
   * 2. Ejecutar use case
   * 3. Formatear respuesta
   * 4. Manejar errores
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer ID del recurso (ya validado por idValidator en la ruta)
      const id = parseInt(req.params.id, 10);

      // 2. Logging de la petición
      this.logger.info(`Request de generación de ${this.resourceName}`, {
        id,
        method: req.method,
        path: req.path,
      });

      // 3. Ejecutar el caso de uso
      // Las opciones vienen de configuración del sistema, no del body
      const result = await this.useCase.execute(id, {});

      // 4. Formatear respuesta exitosa usando ResponseFormatter
      // Pasar result directamente en data (sin envolver en subdivisión) para homogeneizar con listado
      return this.responseFormatter.generated(res, result, this.resourceName, id, req);
    } catch (error) {
      // 5. Manejo de errores consistente
      this.logger.error(`Error al generar ${this.resourceName}`, {
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
