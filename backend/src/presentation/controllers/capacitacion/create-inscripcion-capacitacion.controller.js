import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/inscripciones-capacitacion
 * Inscribe un participante (nuevo o existente por id) a una capacitación,
 * con pago inicial opcional, todo en una transacción.
 */
export class CreateInscripcionCapacitacionController extends BaseCreateController {
  constructor({ createInscripcionCapacitacionUseCase, logger, responseFormatter }) {
    super({
      useCase: createInscripcionCapacitacionUseCase,
      logger,
      responseFormatter,
      resourceName: 'inscripción de capacitación',
      dataFieldName: 'inscripcionCapacitacion',
    });
  }

  /**
   * Pasa userId de la sesión al caso de uso (auditoría created_by).
   */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de inscripción de capacitación', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear inscripción de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }

  sanitizeBodyForLogging(body) {
    const sanitized = { ...body };
    if (sanitized.participante) {
      sanitized.participante = { ...sanitized.participante };
      if (sanitized.participante.ci) sanitized.participante.ci = '***';
      if (sanitized.participante.celular) sanitized.participante.celular = '***';
      if (sanitized.participante.email) sanitized.participante.email = '***';
    }
    return sanitized;
  }
}
