export class CerrarBimestreGestionController {
  constructor({ cerrarBimestreGestionUseCase, logger, responseFormatter }) {
    this.cerrarBimestreGestionUseCase = cerrarBimestreGestionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const numero = Number(req.params.numero);
      const payload = await this.cerrarBimestreGestionUseCase.execute({
        numeroBimestre: numero,
        userId: req.usuario.id,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: `Bimestre ${numero} cerrado` },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error cerrar bimestre', { error: error.message });
      return next(error);
    }
  }
}
