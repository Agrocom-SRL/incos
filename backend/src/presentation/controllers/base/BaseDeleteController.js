/**
 * Controlador base para operaciones de eliminación
 *
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los controladores de eliminación
 *
 * Responsabilidades:
 * - Extraer ID del parámetro de ruta
 * - Ejecutar el caso de uso correspondiente
 * - Formatear respuesta JSON estandarizada
 * - Manejar errores de manera consistente
 *
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de eliminación
 * - Template Method: Define el algoritmo común
 * - Dependency Inversion: Depende de Use Cases (Application Layer)
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja la comunicación HTTP (request/response)
 * - Depende de Use Cases (Application Layer) a través de abstracción
 *
 * @abstract
 */
export class BaseDeleteController {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.useCase - Caso de uso a ejecutar (debe tener método execute(id))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {Object} params.responseFormatter - Formatter de respuestas exitosas (inyectado)
   * @param {string} params.resourceName - Nombre del recurso en español (para logs y mensajes)
   */
  constructor({ useCase, logger, responseFormatter, resourceName }) {
    this.useCase = useCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.resourceName = resourceName;
  }

  /**
   * Maneja la petición HTTP DELETE
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID es requerido',
        });
      }

      this.logger.info(`[${this.resourceName}] Eliminando ${this.resourceName}`, {
        id,
        method: req.method,
        path: req.path,
      });

      // Ejecutar caso de uso
      await this.useCase.execute(parseInt(id, 10));

      // Formatear respuesta exitosa
      return this.responseFormatter.deleted(
        res,
        this.resourceName,
        id,
        req
      );
    } catch (error) {
      next(error);
    }
  }
}
