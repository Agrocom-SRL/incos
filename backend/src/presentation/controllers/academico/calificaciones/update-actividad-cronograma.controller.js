export class UpdateActividadCronogramaController {
  constructor({ updateActividadCronogramaUseCase, logger, responseFormatter }) {
    this.updateActividadCronogramaUseCase = updateActividadCronogramaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id ?? null;
      const data = await this.updateActividadCronogramaUseCase.execute(id, req.body, userId);
      return this.responseFormatter.updated(res, data, 'actividad_cronograma', id, req);
    } catch (error) {
      this.logger.error('[Institucional] Error PUT actividad cronograma', { error: error.message });
      return next(error);
    }
  }
}
