/**
 * PUT /api/v1/docentes/:id
 */
export class UpdateTeacherController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/docentes/UpdateTeacherUseCase.js').UpdateTeacherUseCase} params.updateTeacherUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ updateTeacherUseCase, logger, responseFormatter }) {
    if (!updateTeacherUseCase) throw new Error('updateTeacherUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');

    this.updateTeacherUseCase = updateTeacherUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      this.logger.info('Request de actualización de docente', { id });

      const userId = req.user?.id ?? null;
      const result = await this.updateTeacherUseCase.execute(id, body, userId);
      const docente = result.docente;
      return this.responseFormatter.updated(res, docente, 'docente', docente.id, req);
    } catch (error) {
      this.logger.error('Error al actualizar docente', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
