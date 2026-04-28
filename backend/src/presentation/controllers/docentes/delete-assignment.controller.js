/**
 * DELETE /api/v1/docentes/asignaciones/:id
 */

export class DeleteTeacherAssignmentController {
  /**
   * @param {Object} deps
   * @param {import('../../../application/use-cases/docentes/DeleteTeacherAssignmentUseCase.js').DeleteTeacherAssignmentUseCase} deps.deleteTeacherAssignmentUseCase
   * @param {Object} deps.logger
   * @param {Object} deps.responseFormatter
   */
  constructor({ deleteTeacherAssignmentUseCase, logger, responseFormatter }) {
    this.deleteTeacherAssignmentUseCase = deleteTeacherAssignmentUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params?.id);
      const userId = req.user?.id ?? null;
      await this.deleteTeacherAssignmentUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'asignación docente', id, req);
    } catch (error) {
      this.logger.error('[Docentes] Error al eliminar asignación docente', {
        assignmentId: req.params?.id,
        error: error.message,
      });
      return next(error);
    }
  }
}

