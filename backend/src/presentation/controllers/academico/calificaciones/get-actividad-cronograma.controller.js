export class GetActividadCronogramaController {
  constructor({ getActividadCronogramaUseCase, logger, responseFormatter }) {
    this.getActividadCronogramaUseCase = getActividadCronogramaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params.id);
      const payload = await this.getActividadCronogramaUseCase.execute(id);
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Actividad de cronograma obtenida correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Institucional] Error GET actividad cronograma', { error: error.message });
      return next(error);
    }
  }
}
