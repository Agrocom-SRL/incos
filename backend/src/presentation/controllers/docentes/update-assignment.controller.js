/**
 * PATCH /api/v1/docentes/asignaciones/:id
 */
export class UpdateTeacherAssignmentController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/docentes/UpdateTeacherAssignmentUseCase.js').UpdateTeacherAssignmentUseCase} params.updateTeacherAssignmentUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ updateTeacherAssignmentUseCase, logger, responseFormatter }) {
    if (!updateTeacherAssignmentUseCase) throw new Error('updateTeacherAssignmentUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.updateTeacherAssignmentUseCase = updateTeacherAssignmentUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const body = req.body || {};
      this.logger.info('Request de actualización de asignación docente', { id });
      const userId = req.user?.id ?? null;
      const result = await this.updateTeacherAssignmentUseCase.execute(id, body, userId);
      const asignacion = result.asignacion;
      return this.responseFormatter.updated(res, asignacion, 'asignación docente', asignacion.id, req);
    } catch (error) {
      this.logger.error('Error al actualizar asignación docente', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
