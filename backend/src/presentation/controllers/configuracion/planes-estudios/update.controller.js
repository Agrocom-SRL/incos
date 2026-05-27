export class UpdatePlanEstudiosController {
  constructor({ updatePlanEstudiosUseCase, logger, responseFormatter }) {
    this.updatePlanEstudiosUseCase = updatePlanEstudiosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updatePlanEstudiosUseCase.execute(id, body, userId);
      const plan = result.plan_estudio;
      return this.responseFormatter.updated(res, plan, 'plan de estudios', plan.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

