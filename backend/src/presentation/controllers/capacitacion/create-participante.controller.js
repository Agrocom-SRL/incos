import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/participantes
 * Crea un participante (valida unicidad CI+expedición en lógica de negocio).
 */
export class CreateParticipanteController extends BaseCreateController {
  constructor({ createParticipanteUseCase, logger, responseFormatter }) {
    super({
      useCase: createParticipanteUseCase,
      logger,
      responseFormatter,
      resourceName: 'participante',
      dataFieldName: 'participante',
    });
  }

  /**
   * Pasa userId de la sesión al caso de uso (auditoría created_by).
   */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de participante', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear participante', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }

  sanitizeBodyForLogging(body) {
    const sanitized = { ...body };
    if (sanitized.ci) sanitized.ci = '***';
    if (sanitized.celular) sanitized.celular = '***';
    if (sanitized.email) sanitized.email = '***';
    return sanitized;
  }
}
