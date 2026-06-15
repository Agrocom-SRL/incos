export class ValidarCierreBimestreController {
  constructor({ validarCierreBimestreUseCase, logger, responseFormatter }) {
    this.validarCierreBimestreUseCase = validarCierreBimestreUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const numero = Number(req.params.numero);
      const payload = await this.validarCierreBimestreUseCase.execute({ numeroBimestre: numero });
      return this.responseFormatter._success(res, payload, {}, req);
    } catch (error) {
      this.logger.error('[Calificaciones] Error validar cierre', { error: error.message });
      return next(error);
    }
  }
}
