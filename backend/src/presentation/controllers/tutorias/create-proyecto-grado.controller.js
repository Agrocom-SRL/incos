import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/proyectos-grado (T7)
 * Crea el proyecto de grado + TITULAR (e integrantes si la modalidad es PSP).
 * dataFieldName: 'proyectoGrado'.
 */
export class CreateProyectoGradoController extends BaseCreateController {
  constructor({ createProyectoGradoUseCase, logger, responseFormatter }) {
    super({
      useCase: createProyectoGradoUseCase,
      logger,
      responseFormatter,
      resourceName: 'proyecto de grado',
      dataFieldName: 'proyectoGrado',
    });
  }

  /** Pasa userId de la sesión al caso de uso (auditoría created_by). */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de proyecto de grado', {
        body: this.sanitizeBodyForLogging(body),
      });
      const userId = req.usuario?.id ?? null;
      const result = await this.useCase.execute(this.prepareData(body), userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear proyecto de grado', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
