/**
 * PATCH /api/v1/nivelaciones/examenes/:levelingId/resultado
 */
export class RegistrarResultadoNivelacionController {
  constructor({ registrarResultadoNivelacionUseCase, logger, responseFormatter }) {
    this.registrarResultadoNivelacionUseCase = registrarResultadoNivelacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.registrarResultadoNivelacionUseCase.execute({
        usuarioId: req.user?.id ?? null,
        levelingId: req.params.levelingId,
        ...req.body,
      });

      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Resultado de nivelación registrado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error PATCH resultado de nivelación', {
        error: error.message,
      });
      return next(error);
    }
  }
}

export default RegistrarResultadoNivelacionController;
