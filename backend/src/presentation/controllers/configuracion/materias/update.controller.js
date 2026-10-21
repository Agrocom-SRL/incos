export class UpdateMateriaController {
  constructor({ updateMateriaUseCase, logger, responseFormatter }) {
    this.updateMateriaUseCase = updateMateriaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateMateriaUseCase.execute(id, body, userId);
      const materia = result.materia;
      return this.responseFormatter.updated(res, materia, 'materia', materia.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
