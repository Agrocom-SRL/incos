import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/acompanamiento/sesiones (A6)
 * Crea una sesión de refuerzo + estudiantes iniciales.
 * dataFieldName: 'sesionRefuerzo'.
 */
export class CreateSesionRefuerzoController extends BaseCreateController {
  constructor({ createSesionRefuerzoUseCase, logger, responseFormatter }) {
    super({
      useCase: createSesionRefuerzoUseCase,
      logger,
      responseFormatter,
      resourceName: 'sesión de refuerzo',
      dataFieldName: 'sesionRefuerzo',
    });
  }

  /** Pasa userId de la sesión al caso de uso (auditoría created_by). */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de sesión de refuerzo', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nueva';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear sesión de refuerzo', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
