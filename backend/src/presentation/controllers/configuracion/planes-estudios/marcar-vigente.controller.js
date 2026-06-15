export class MarcarPlanEstudiosVigenteController {
  constructor({ marcarPlanEstudiosVigenteUseCase, logger, responseFormatter }) {
    this.marcarPlanEstudiosVigenteUseCase = marcarPlanEstudiosVigenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const result = await this.marcarPlanEstudiosVigenteUseCase.execute(id, userId);
      const plan = result.plan_estudio;
      return this.responseFormatter.updated(res, plan, 'plan de estudios', plan.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

