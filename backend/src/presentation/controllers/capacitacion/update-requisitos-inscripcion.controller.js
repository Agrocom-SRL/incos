/**
 * PUT /api/v1/inscripciones-capacitacion/:id/requisitos
 * Actualiza el checklist de requisitos de la inscripción y recalcula su estado.
 * dataFieldName: 'inscripcionCapacitacion'.
 */
export class UpdateRequisitosInscripcionController {
  constructor({ updateRequisitosInscripcionUseCase, logger, responseFormatter }) {
    this.useCase = updateRequisitosInscripcionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const { inscripcionCapacitacion } = await this.useCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(
        res,
        { inscripcionCapacitacion },
        'requisitos de la inscripción',
        id,
        req
      );
    } catch (error) {
      this.logger.error('Error al actualizar requisitos de inscripción', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
