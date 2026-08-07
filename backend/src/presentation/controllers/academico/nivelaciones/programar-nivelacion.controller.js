/**
 * POST /api/v1/nivelaciones/examenes — programa un examen de nivelación.
 */
export class ProgramarNivelacionController {
  constructor({ programarNivelacionUseCase, logger, responseFormatter }) {
    this.programarNivelacionUseCase = programarNivelacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.programarNivelacionUseCase.execute({
        usuarioId: req.user?.id ?? null,
        ...req.body,
      });

      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 201, message: 'Nivelación programada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error POST programar nivelación', {
        error: error.message,
      });
      return next(error);
    }
  }
}

export default ProgramarNivelacionController;
