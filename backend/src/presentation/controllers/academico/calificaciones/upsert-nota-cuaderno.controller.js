export class UpsertNotaCuadernoController {
  constructor({ upsertNotaCuadernoUseCase, logger, responseFormatter }) {
    this.upsertNotaCuadernoUseCase = upsertNotaCuadernoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const nota = await this.upsertNotaCuadernoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestre: req.params.bimestre,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        { nota },
        { message: 'Nota guardada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error PUT nota cuaderno', { error: error.message });
      return next(error);
    }
  }
}
