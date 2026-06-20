/**
 * PUT /api/v1/asistencia/licencias/:id/cancel
 */
export class CancelarLicenciaController {
  constructor({ cancelarLicenciaUseCase, logger, responseFormatter }) {
    this.cancelarLicenciaUseCase = cancelarLicenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.cancelarLicenciaUseCase.execute({
        usuarioId: req.usuario.id,
        id: Number(req.params.id),
        observacionesDecision: req.body?.observacionesDecision,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Licencia cancelada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error PUT cancelar', { error: error.message });
      return next(error);
    }
  }
}

export default CancelarLicenciaController;
