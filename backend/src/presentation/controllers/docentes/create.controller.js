import { BaseCreateController } from '../base/BaseCreateController.js';

/**
 * POST /api/v1/docentes
 */
export class CreateTeacherController extends BaseCreateController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/docentes/CreateTeacherUseCase.js').CreateTeacherUseCase} params.createTeacherUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ createTeacherUseCase, logger, responseFormatter }) {
    super({
      useCase: createTeacherUseCase,
      logger,
      responseFormatter,
      resourceName: 'docente',
      dataFieldName: 'docente',
    });
  }

  /**
   * Pasa userId del JWT al caso de uso.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const body = req.body || {};
      this.logger.info('Request de creación de docente', {
        body: this.sanitizeBodyForLogging(body),
      });
      const preparedData = this.prepareData(body);
      const userId = req.user?.id ?? null;
      const result = await this.useCase.execute(preparedData, userId);
      const responseData = result[this.dataFieldName] || result;
      const resourceId = responseData?.id || 'nuevo';
      return this.responseFormatter.created(res, responseData, this.resourceName, resourceId, req);
    } catch (error) {
      this.logger.error('Error al crear docente', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }

  sanitizeBodyForLogging(body) {
    const sanitized = { ...body };
    if (sanitized.ci) sanitized.ci = '***';
    if (sanitized.emailPersonal) sanitized.emailPersonal = '***';
    if (sanitized.celular) sanitized.celular = '***';
    if (sanitized.telefono) sanitized.telefono = '***';
    if (sanitized.direccion) sanitized.direccion = '***';
    return sanitized;
  }
}
