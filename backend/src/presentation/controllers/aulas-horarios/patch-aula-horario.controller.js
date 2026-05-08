export class PatchAulaHorarioController {
  constructor({ patchAulaHorarioUseCase, logger, responseFormatter }) {
    this.useCase = patchAulaHorarioUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const courseScheduleId = Number(req.params.cursoHorarioId);
      const aulaId = req.body?.aulaId ?? null;
      const result = await this.useCase.execute(courseScheduleId, aulaId, req.user?.id ?? null);
      return this.responseFormatter.updated(res, result, 'aula de bloque de horario', courseScheduleId, req);
    } catch (error) {
      this.logger.error('Error al actualizar aula en bloque de horario', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

