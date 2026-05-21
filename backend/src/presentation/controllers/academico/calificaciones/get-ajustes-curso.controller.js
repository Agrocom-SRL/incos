export class GetAjustesCursoController {
  constructor({ getAjustesCursoUseCase, logger, responseFormatter }) {
    this.getAjustesCursoUseCase = getAjustesCursoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const asignacionId = Number(req.params.asignacionId);
      const payload = await this.getAjustesCursoUseCase.execute({ asignacionId });
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Ajustes del curso obtenidos' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error GET ajustes curso', { error: error.message });
      return next(error);
    }
  }
}
