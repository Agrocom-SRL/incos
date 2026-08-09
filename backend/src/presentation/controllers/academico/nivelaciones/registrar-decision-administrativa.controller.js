/**
 * POST /api/v1/nivelaciones/decisiones-administrativas — ABANDONO/RETIRADO.
 */
export class RegistrarDecisionAdministrativaController {
  constructor({ registrarDecisionAdministrativaUseCase, logger, responseFormatter }) {
    this.registrarDecisionAdministrativaUseCase = registrarDecisionAdministrativaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.registrarDecisionAdministrativaUseCase.execute({
        usuarioId: req.user?.id ?? null,
        ...req.body,
      });

      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 201, message: 'Decisión administrativa registrada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error POST decisión administrativa', {
        error: error.message,
      });
      return next(error);
    }
  }
}

export default RegistrarDecisionAdministrativaController;
