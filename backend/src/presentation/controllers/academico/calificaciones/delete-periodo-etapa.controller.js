export class DeletePeriodoEtapaController {
  constructor({ deletePeriodoEtapaUseCase, logger, responseFormatter }) {
    this.deletePeriodoEtapaUseCase = deletePeriodoEtapaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.id ?? null;
      await this.deletePeriodoEtapaUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'periodo', id, req);
    } catch (error) {
      this.logger.error('[Institucional] Error DELETE etapa de periodo', { error: error.message });
      return next(error);
    }
  }
}
