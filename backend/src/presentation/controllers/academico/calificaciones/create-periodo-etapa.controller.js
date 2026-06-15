export class CreatePeriodoEtapaController {
  constructor({ createPeriodoEtapaUseCase, logger, responseFormatter }) {
    this.createPeriodoEtapaUseCase = createPeriodoEtapaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const userId = req.user?.id ?? null;
      const payload = {
        nombre: req.body.nombre,
        fechaInicio: req.body.fechaInicio ?? req.body.fecha_inicio,
        fechaFin: req.body.fechaFin ?? req.body.fecha_fin,
        division: req.body.division,
        colorHex: req.body.colorHex ?? req.body.color_hex ?? null,
      };
      const data = await this.createPeriodoEtapaUseCase.execute(payload, userId);
      return this.responseFormatter.created(res, { periodo: data }, 'periodo', data.id, req);
    } catch (error) {
      this.logger.error('[Institucional] Error POST etapa de periodo', { error: error.message });
      return next(error);
    }
  }
}
