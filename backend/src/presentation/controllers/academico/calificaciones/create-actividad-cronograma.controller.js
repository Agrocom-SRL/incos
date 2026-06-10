export class CreateActividadCronogramaController {
  constructor({ createActividadCronogramaUseCase, logger, responseFormatter }) {
    this.createActividadCronogramaUseCase = createActividadCronogramaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const userId = req.user?.id ?? null;
      const data = await this.createActividadCronogramaUseCase.execute(req.body, userId);
      return this.responseFormatter.created(res, data, 'actividad_cronograma', data?.id, req);
    } catch (error) {
      this.logger.error('[Institucional] Error POST actividad cronograma', { error: error.message });
      return next(error);
    }
  }
}
