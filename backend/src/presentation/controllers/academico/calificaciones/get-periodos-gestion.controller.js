export class GetPeriodosGestionController {
  constructor({ getPeriodosGestionUseCase, logger, responseFormatter }) {
    this.getPeriodosGestionUseCase = getPeriodosGestionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getPeriodosGestionUseCase.execute();
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Periodos de la gestión vigente obtenidos correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Institucional] Error GET periodos gestión', { error: error.message });
      return next(error);
    }
  }
}
