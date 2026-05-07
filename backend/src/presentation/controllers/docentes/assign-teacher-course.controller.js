/**
 * POST /api/v1/docentes/asignaciones/curso
 */
export class AssignTeacherToCourseController {
  constructor({ assignTeacherToCourseUseCase, logger, responseFormatter }) {
    if (!assignTeacherToCourseUseCase) throw new Error('assignTeacherToCourseUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    if (!responseFormatter) throw new Error('responseFormatter es requerido');
    this.assignTeacherToCourseUseCase = assignTeacherToCourseUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const body = req.body || {};
      const userId = req.user?.id ?? null;
      const result = await this.assignTeacherToCourseUseCase.execute(body, userId);
      const payload = {
        asignacion: result.asignacion,
        warnings: Array.isArray(result.warnings) ? result.warnings : [],
      };
      return this.responseFormatter.updated(
        res,
        payload,
        'asignación docente',
        result?.asignacion?.id ?? 'curso',
        req
      );
    } catch (error) {
      this.logger.error('Error al asignar docente por curso', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
