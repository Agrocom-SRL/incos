export class IniciarGestionAcademicaController {
  constructor({ iniciarGestionAcademicaUseCase, logger, responseFormatter }) {
    this.iniciarGestionAcademicaUseCase = iniciarGestionAcademicaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.iniciarGestionAcademicaUseCase.execute({
        userId: req.usuario.id,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Gestión académica iniciada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error iniciar gestión', { error: error.message });
      return next(error);
    }
  }
}
