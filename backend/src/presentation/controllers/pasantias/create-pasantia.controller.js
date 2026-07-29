import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/pasantias (P3)
 * Registra el trámite (PASANTIA o CONVALIDACION). dataFieldName: 'pasantia'.
 */
export class CreatePasantiaController extends BaseCreateController {
  constructor({ createPasantiaUseCase, logger, responseFormatter }) {
    super({
      useCase: createPasantiaUseCase,
      logger,
      responseFormatter,
      resourceName: 'pasantía',
      dataFieldName: 'pasantia',
    });
  }

  /** Pasa userId de la sesión al caso de uso (auditoría created_by). */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('[Pasantías] Request de registro de trámite', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('[Pasantías] Error al registrar trámite', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
