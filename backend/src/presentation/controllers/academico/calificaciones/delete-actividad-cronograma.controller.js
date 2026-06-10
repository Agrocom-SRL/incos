export class DeleteActividadCronogramaController {
  constructor({ deleteActividadCronogramaUseCase, logger, responseFormatter }) {
    this.deleteActividadCronogramaUseCase = deleteActividadCronogramaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id ?? null;
      await this.deleteActividadCronogramaUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'actividad_cronograma', id, req);
    } catch (error) {
      this.logger.error('[Institucional] Error DELETE actividad cronograma', { error: error.message });
      return next(error);
    }
  }
}
