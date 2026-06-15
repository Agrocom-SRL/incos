/**
 * PUT /api/v1/inscripciones/:id/historial-previo
 * Reemplaza las filas de historial_previo de una inscripción.
 */
export class UpdateEnrollmentPriorHistoryController {
  constructor({ updateEnrollmentUseCase, logger, responseFormatter }) {
    this.updateEnrollmentUseCase = updateEnrollmentUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    const enrollmentId = Number(req.params.id);
    const body = req.body || {};

    try {
      const priorHistory = body.prior_history ?? body.priorHistory ?? [];
      const updated = await this.updateEnrollmentUseCase.executePriorHistoryOnly(
        enrollmentId,
        priorHistory
      );
      return this.responseFormatter.updated(
        res,
        { enrollment: updated },
        'historial previo de la inscripción',
        enrollmentId,
        req
      );
    } catch (error) {
      next(error);
    }
  }
}
