/**
 * PUT /api/v1/asistencia/licencias/:id/decision
 */
export class DecidirLicenciaController {
  constructor({ decidirLicenciaUseCase, logger, responseFormatter }) {
    this.decidirLicenciaUseCase = decidirLicenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.decidirLicenciaUseCase.execute({
        usuarioId: req.usuario.id,
        id: Number(req.params.id),
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Decisión de licencia aplicada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error PUT decisión', { error: error.message });
      return next(error);
    }
  }
}

export default DecidirLicenciaController;
