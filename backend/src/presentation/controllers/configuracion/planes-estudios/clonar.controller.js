export class ClonarPlanEstudiosController {
  constructor({ clonarPlanEstudiosUseCase, logger, responseFormatter }) {
    this.clonarPlanEstudiosUseCase = clonarPlanEstudiosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const result = await this.clonarPlanEstudiosUseCase.execute(id, userId);
      const plan = result.plan_estudio;
      return this.responseFormatter.created(res, plan, 'plan de estudios', plan.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
