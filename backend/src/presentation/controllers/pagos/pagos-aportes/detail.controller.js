/**
 * GET /api/v1/pagos-aportes/:id
 * Controller para obtener el detalle de un pago de aporte por ID
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para obtener un pago por ID
 * - Delegar lógica de negocio a GetPaymentAporteByIdUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/pagos-aportes/:id
 * 
 * Route Parameters:
 * - id: ID del pago a obtener (requerido)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para obtener un pago
 * - Dependency Inversion: Depende de GetPaymentAporteByIdUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */

export class GetPaymentAporteByIdController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GetPaymentAporteByIdUseCase} params.getPaymentAporteByIdUseCase - Caso de uso para obtener pago por ID
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ getPaymentAporteByIdUseCase, logger, responseFormatter }) {
    this.getPaymentAporteByIdUseCase = getPaymentAporteByIdUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  /**
   * Maneja la petición HTTP GET para obtener un pago por ID
   * 
   * @param {Object} req - Request de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del pago
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const paymentId = parseInt(id, 10);

      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ID de pago inválido',
            code: 'INVALID_PAYMENT_ID',
          },
        });
      }

      this.logger.info('[Pagos] Obteniendo pago por ID', {
        paymentId,
      });

      // Ejecutar caso de uso
      const payment = await this.getPaymentAporteByIdUseCase.execute(paymentId);

      // Formatear respuesta exitosa usando el método retrieved del formatter
      return this.responseFormatter.retrieved(
        res,
        payment,
        'pago',
        paymentId,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al obtener pago por ID', {
        error: error.message,
        stack: error.stack,
        paymentId: req.params.id,
      });

      // Pasar el error al middleware de manejo de errores
      return next(error);
    }
  }
}
