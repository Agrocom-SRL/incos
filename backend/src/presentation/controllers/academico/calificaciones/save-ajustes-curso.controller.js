export class SaveAjustesCursoController {
  constructor({ saveAjustesCursoUseCase, logger, responseFormatter }) {
    this.saveAjustesCursoUseCase = saveAjustesCursoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const asignacionId = Number(req.params.asignacionId);
      const payload = await this.saveAjustesCursoUseCase.execute({
        asignacionId,
        body: req.body ?? {},
        userId: req.usuario.id,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Ajustes del curso guardados' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error PUT ajustes curso', { error: error.message });
      return next(error);
    }
  }
}
