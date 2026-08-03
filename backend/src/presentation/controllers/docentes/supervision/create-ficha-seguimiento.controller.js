import { BaseCreateController } from '../../base/BaseCreateController.js';

/**
 * POST /api/v1/supervision-docente (S3)
 * Registra la ficha de seguimiento en clase. El evaluador (supervisor_id) es
 * SIEMPRE el usuario de la sesión — jamás se toma del body.
 * Permiso: docentes.supervision.ficha CREAR. dataFieldName: 'fichaSeguimiento'.
 */
export class CreateFichaSeguimientoController extends BaseCreateController {
  constructor({ createFichaSeguimientoUseCase, logger, responseFormatter }) {
    super({
      useCase: createFichaSeguimientoUseCase,
      logger,
      responseFormatter,
      resourceName: 'ficha de seguimiento',
      dataFieldName: 'fichaSeguimiento',
    });
  }

  /** Pasa el usuario de la sesión al caso de uso (evaluador + created_by). */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('[Supervisión docente] Request de registro de ficha', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('[Supervisión docente] Error al registrar ficha', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
