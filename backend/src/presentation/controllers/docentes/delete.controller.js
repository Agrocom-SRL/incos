/**
 * DELETE /api/v1/docentes/:id
 */

export class DeleteTeacherController {
  /**
   * @param {Object} deps
   * @param {import('../../../application/use-cases/docentes/DeleteTeacherUseCase.js').DeleteTeacherUseCase} deps.deleteTeacherUseCase
   * @param {Object} deps.logger
   * @param {Object} deps.responseFormatter
   */
  constructor({ deleteTeacherUseCase, logger, responseFormatter }) {
    this.deleteTeacherUseCase = deleteTeacherUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params?.id);
      const userId = req.user?.id ?? null;
      await this.deleteTeacherUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'docente', id, req);
    } catch (error) {
      this.logger.error('[Docentes] Error al eliminar docente', {
        teacherId: req.params?.id,
        error: error.message,
      });
      return next(error);
    }
  }
}
