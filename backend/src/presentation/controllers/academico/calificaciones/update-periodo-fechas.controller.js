export class UpdatePeriodoFechasController {
  constructor({ updatePeriodoFechasUseCase, logger, responseFormatter }) {
    this.updatePeriodoFechasUseCase = updatePeriodoFechasUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id ?? null;
      const fechaInicio = req.body.fechaInicio ?? req.body.fecha_inicio;
      const fechaFin = req.body.fechaFin ?? req.body.fecha_fin;
      const data = await this.updatePeriodoFechasUseCase.execute(
        { id, fechaInicio, fechaFin },
        userId,
      );
      return this.responseFormatter.updated(res, { periodo: data }, 'periodo', id, req);
    } catch (error) {
      this.logger.error('[Institucional] Error PUT fechas de periodo', { error: error.message });
      return next(error);
    }
  }
}
