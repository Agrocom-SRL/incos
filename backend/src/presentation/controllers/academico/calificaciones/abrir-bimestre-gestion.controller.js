export class AbrirBimestreGestionController {
  constructor({ abrirBimestreGestionUseCase, logger, responseFormatter }) {
    this.abrirBimestreGestionUseCase = abrirBimestreGestionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const numero = Number(req.params.numero);
      const payload = await this.abrirBimestreGestionUseCase.execute({
        numeroBimestre: numero,
        userId: req.usuario.id,
      });
      return this.responseFormatter._success(
        res,
        payload,
        { message: `Bimestre ${numero} abierto` },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error abrir bimestre', { error: error.message });
      return next(error);
    }
  }
}
